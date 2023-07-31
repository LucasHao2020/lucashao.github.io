function getHeapPtrFromUInt8Array(listArray) {
    let ptr = Module._malloc(listArray.length * listArray.BYTES_PER_ELEMENT);
    Module.HEAPU8.set(listArray, ptr / listArray.BYTES_PER_ELEMENT);
    return ptr;
}

function getHeapPtrFromInt32Array(listArray) {
    let ptr = Module._malloc(listArray.length * listArray.BYTES_PER_ELEMENT);
    Module.HEAP32.set(listArray, ptr / listArray.BYTES_PER_ELEMENT);
    return ptr;
}

function getHeapPtrFromDoubleArray(listArray) {
    let ptr = Module._malloc(listArray.length * listArray.BYTES_PER_ELEMENT);
    Module.HEAPF64.set(listArray, ptr / listArray.BYTES_PER_ELEMENT);
    return ptr;
}

function getHeapPtrFromFloatArray(listArray) {
    let ptr = Module._malloc(listArray.length * listArray.BYTES_PER_ELEMENT);
    Module.HEAPF32.set(listArray, ptr / listArray.BYTES_PER_ELEMENT);
    return ptr;
}

function actionPushImage(data) {
    let ptrImg = getHeapPtrFromUInt8Array(data.imgData);
    let ptrParam = getHeapPtrFromInt32Array(data.param);
    let strPose = "";
    try {
        strPose = funPushImg(data.frame, data.time, ptrParam, data.length, ptrImg);
    } catch (error) {
        hwar.sendLogInfo("[actionPushImage] error:" + error);
    } finally {
        Module._free(ptrImg);
    }
    return strPose;
}

function actionPushVps(data) {
    let vpsSlamPose64Array = new Float64Array(data.pose);
    let ptrVpsSlamPose = getHeapPtrFromDoubleArray(vpsSlamPose64Array);
    let nType = data.type;
    try {
        let nVPSResult = funSetVPSData(nType, data.uploadTime, data.downloadTime, ptrVpsSlamPose, data.poseLength);
    } catch (error) {
        hwar.sendLogInfo("[actionPushVps] error:" + error);
    } finally {
        Module._free(ptrVpsSlamPose);
    }
}

function funPushImuData(imuData, imuNum) {
    let imuF64Array = new Float64Array(imuData);
    let ptrImu = getHeapPtrFromDoubleArray(imuF64Array);
    try {
        funPushImu(imuNum, ptrImu);
    } catch (error) {
        hwar.sendLogInfo("[funPushImuData] error:" + error);
    } finally {
        Module._free(ptrImu);
    }
}

let funGetVersion;

let funStart;
let funStop;
let funPause;
let funResume;

let funPushImu;
let funPushImg;
let funGetPose;
let funSetImuInterFlag;
let funSetVPSData;
let funUpdateSlamParam;
let funStartWithPhoneType;
let funStartWithType;

window.slamReady = false;
let Module = initModule();
let time = setInterval(() => {
    if (Module["asm"]) {
        clearInterval(time);
        window.slamReady = true;

        funGetVersion = Module.cwrap("GetVersion", "string", []);

        funStart = Module.cwrap("StartSlam", "int", ["number", "number", "number"]);
        funStartWithPhoneType = Module.cwrap("StartSlam", "int", ["number", "number", "number", "string"]);
        funStartWithType = Module.cwrap("StartSlam", "int", ["number", "number", "number"]);//neicangeshu/neican/type
        funStop = Module.cwrap("StopSlam", "int", []);
        funPause = Module.cwrap("PauseSlam", "int", []);
        funResume = Module.cwrap("ResumeSlam", "int", []);

        funPushImu = Module.cwrap("PushIMU", "int", ["number", "number"]);
        funPushImg = Module.cwrap("PushImage", "string", ["number", "number", "number", "number", "number"]);
        funSetVPSData = Module.cwrap("SetVPSData", "int", ["number", "number", "number", "number", "number"]);
        funUpdateSlamParam = Module.cwrap("UpdateSlamParam", "int", ["number", "number", "number", "number"]);
    }
}, 50);
