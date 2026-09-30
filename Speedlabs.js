let appName = "SpeEdLabs";
let local_storage_key = 'speedlabs_login_user';
// let base_url = "https://stg-data-apis.speedlabs.in/v7/"; //staging server

let base_url = "https://prd-data-apis.speedlabs.in/v7/"; //production server
let ApiGetAccessToken = `${base_url}unverified-user/login-with-rfid-code`;
let ApiGetBatchInfoForTeacher = `${base_url}teacher/get-batch-info-for-teacher`;
let ApiGetRefreshToken = `${base_url}unverified-user/refresh-access-token`;
let ApiGetUserProfileInfo = `${base_url}user/get-user-profile`;
let ApiGetUserCityInfo = `${base_url}common/get-all-cities`;
let ApiGeCourseProgressInfo = `${base_url}affiliation-report/batch-wise-syllabus-coverage`;
let ApiGetBatchPerformanceStudentwise = `${base_url}affiliation-report/get-batch-performance-studentwise-cards`;
let ApiGetBatchPerformanceOverview = `${base_url}affiliation-report/get-batch-performance-overview-cards`;
let ApiGetBatchPerformanceChapterwise = `${base_url}affiliation-report/get-batch-performance-chapterwise-cards`
let ApiGetTestsForBatch = `${base_url}activity/get-activities-for-batch`;
let ApiGetBulkOmrUploadUrl = `${base_url}activity-offline/get-bulk-omr-upload-url`;
let ApiSubmitOmrProcessing = `${base_url}activity-offline/submit-bulk-omrs-for-processing`;
let ApiGetTestConfigForBatch = `${base_url}activity-offline/get-activity-asset-for-batch`;

// AzureBaseUrl = 'https://testassignment.blob.core.windows.net'; // test account 
// let AzureBaseUrl = 'https://testassignment.blob.core.windows.net';

let AzureBaseUrl = 'https://questionkscimagestorage.blob.core.windows.net';
let AzureFullUrl = '';
let Kiosk_Info = {};
let API_Status = "";

const ActivityTypeIdsEnum = {
  SELF_PRACTICE: 5,
  SELF_TEST: 6,
  INSTITUTE_TEST: 7,
  ASSIGNMENT: 8,
  SELF_ASSIGNMENT: 9,
  STUDENT_PRELOADED_TEST: 201,
  INSTITUTE_PRELOADED_TEST: 202,
  INTERNAL_PRELOADED_TEST: 203,
  PAST_YEAR_PAPER: 301,
  STUDENT_TEST_SERIES: 401,
  INSTITUTE_TEST_SERIES: 402,
  STUDENT_OLYMPIAD_TEST: 501,
  INSTITUTE_OLYMPIAD_TEST: 502,
  WORKBOOK_EXERCISE: 601,
  STUDENT_PRELOADED_ASSIGNMENT: 801,
  INSTITUTE_PRELOADED_ASSIGNMENT: 802,
  INTERNAL_PRELOADED_ASSIGNMENT: 803,
  VIDEO_ACTIVITY: 901,
};

function getMappedActivityTypeIds(activityTypeId) {
  return MappedActivityTypeIds[activityTypeId] || [];
}

const MappedActivityTypeIds = {
  7: [7, 202, 402, 502],
  8: [8, 802],
  6: [6],
};

async function checkIsUserLoginInfo(AccessToken) {
  console.log("11: checkIsUserLoginInfo");
  vExecute("store-get", JSON.stringify({ "key": local_storage_key }), "callBackIsUserLogin", "UserLogin");
};

function registerEventListener(event, tag, jData) {
  console.log("6: registerEventListener function called", user_details);
  console.log("user_details", user_details);
  console.log("token:", user_details.AccessToken);
  console.log("type:", typeof user_details.AccessToken);
  if (!user_details.AccessToken) {
    vExecute('event-listener', JSON.stringify({ event, data: jData }), "RfidDataCallBack", "rfid");
  } console.log("registerEventListener not executed");
  return;
}

function getAccessToken(rfidCode, project_url) {
  console.log("10: getAccessToken function called");
  console.log("rfidCode", rfidCode);
  lastRfidCode = rfidCode;
  let body = JSON.stringify({
    "rfidCode": rfidCode,
    "appName": appName
  });
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: project_url,
        method: "POST",
        header: [
          "Content-Type: application/json",
          "Accept: application/json"
        ],
        body: btoa(body)
      }
    }
  }), "callBackAccessToken", "login");
}

function getCourseProgressInfo(token, AffiliationId, startDate, endDate, project_url) {
  console.log('getCourseProgressInfo', user_details.AffiliationId, startDate, endDate, project_url);
  console.log(typeof (startDate));
  console.log("Types:", typeof startTs, typeof endTs);
  let url = `${project_url}?affiliationId=${user_details.AffiliationId}&startDate=${startDate}&endDate=${endDate}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackCourseProgress", "CourseProgress");
}

function getBatchInfo(token, user_id, project_url) {
  console.log("14: getBatchInfo function called");
  let url = `${project_url}?teacherId=${user_id}&onlyActive=true`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackBatchInfo", "teacher_batch_info");
}

function getBatchPerformanceStudentWise(token, batch_id, subject_id, project_url) {
  console.log("15: getBatchPerformance function called", batch_id, subject_id);
  let url = `${project_url}?batchId=${batch_id}&subjectId=${subject_id}&isDemoUser=${user_details.IsDemoUser}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackBatchPerformanceStudentWise", "batch_performance_student_wise");
}

function getTestInfo(token, batchId, activityTypeId, project_url) {
  const activityTypeIds = getMappedActivityTypeIds(activityTypeId);
  console.log("Mapped IDs:", activityTypeIds);
  const queryParams = new URLSearchParams();
  queryParams.append("batchId", batchId);
  activityTypeIds.forEach(id => { queryParams.append("activityTypeIds", id); });
  const url = `${project_url}?${queryParams.toString()}`;
  console.log("Final URL:", url);
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackTestInfo", "batchId");
}

function getTestConfigForBatch(token, activityId, batchId, project_url, pdfAssetType = "OMR") {
  console.log("getTestConfigForBatch called");
  let url = `${project_url}?activityId=${activityId}` + `&batchId=${batchId}` + `&pdfAssetType=${pdfAssetType}`; console.log("Final URL:", url);
  console.log("Getting test config for batch with URL:", url);
  vExecute(
    'api-proxy',
    JSON.stringify({
      data: {
        api: {
          url: url,
          method: "GET",
          header: [
            "Accept: application/json",
            `Authorization: Bearer ${token}`
          ]
        }
      }
    }),
    "callBackGetTestConfig", "getTestConfig");
}

function getOmrUploadConfig(token, SelectedInstituteTestId, SelectedBatchForTestsId, ContentType, PdfFileChecksum, project_url) {
  console.log("17: getOmrUploadConfig");
  let url = `${project_url}?activityId=${SelectedInstituteTestId}&batchId=${SelectedBatchForTestsId}&contentType=${ContentType}&pdf&fileMd5Checksum=${PdfFileChecksum}`
  console.log("bULK OMR UPLOD URL", url);
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackOmrUploadUrlInfo", "test_upload_url_info");
}

function getSubmitOmrUploadResponse(token, SelectedInstituteTestId, SelectedBatchForTestsId, ContentType, UpdatedAzureOmrUploadShortUrl, FileUUID, project_url) {
  console.log("18: getSubmitOmrUploadResponse");
  console.log("getSubmitOmrUploadResponse function called", SelectedInstituteTestId, " or ", SelectedBatchForTestsId, " or ", ContentType, " or ", UpdatedAzureOmrUploadShortUrl, " or ", FileUUID, " or ", project_url);
  let body = JSON.stringify({
    "ActivityId": SelectedInstituteTestId,
    "BatchId": SelectedBatchForTestsId,
    "UploadUUID": FileUUID,
    "UploadedFileUrl": `~/${UpdatedAzureOmrUploadShortUrl}`,
    "ContentType": "application/pdf",
    "FileMd5Checksum": PdfFileChecksum
  });
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: project_url,
        method: "POST",
        header: [
          "Content-Type: application/json",
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ],
        body: btoa(body)
      }
    }
  }), "callBackSubmitOmrUplod", "submitOmrUpload");
}

function GetBatchPerformanceOverview(token, batch_id, subject_id, project_url) {
  console.log("19: getBatchPerformance function called", batch_id, subject_id);
  if (!batch_id || !subject_id) { toastr.error("Select batch and subject first"); hideLoader(); return; }
  let url = `${project_url}?batchId=${batch_id}&subjectId=${subject_id}&isDemoUser=${user_details.IsDemoUser}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackBatchPerformanceOverview", "batch_performance_overview");
}

function GetBatchPerformanceChapterWise(token, batch_id, subject_id, project_url) {
  console.log("20: getBatchPerformance function called", batch_id, subject_id,);
  let url = `${project_url}?batchId=${batch_id}&subjectId=${subject_id}&isDemoUser=${user_details.IsDemoUser}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackBatchPerformanceChapterWise", "batch_performance_chapterwise");
}

async function confirmUploadOmr() {
  console.log("22: confirmUploadOmr");
  if (!SelectedBatchForTestsId) {
    toastr.error("Please select batch first");
    return;
  }
  let modalEl = document.getElementById('delete_confirmModal');
  let modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  let title = document.getElementById('modal-title');
  if (title) title.innerText = "";
  modal.hide();
  showLoader();
  stopCamera();
  if (!capturedBuffers.length) {
    toastr.error("No images to upload");
    hideLoader();
    return;
  }
  PdfFileChecksum = generateChecksum();
  let pdfBlob = await generateOmrPDF();
  if (!pdfBlob) {
    toastr.error("PDF generation failed");
    hideLoader();
    return;
  }
  getOmrUploadConfig(user_details.AccessToken, SelectedInstituteTestId, SelectedBatchForTestsId, "application/pdf", PdfFileChecksum, ApiGetBulkOmrUploadUrl);
}

function getRefreshTockenInfo(token, project_url) {
  console.log("23: getRefreshTockenInfo function called");
  let url = `${project_url}?refreshToken=${token}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
        ]
      }
    }
  }), "callBackRefreshTockenInfo", "RefreshTockenInfo");
}

function getUserProfileInfo(token, userId, project_url) {
  console.log("24: getUserProfileInfo function called");
  let url = `${project_url}?userId=${userId}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackUserProfileInfo", "UserProfileInfo");
}

function getUserCityInfo(token, userId, project_url) {
  console.log("24: getUserCityInfo function called");
  let url = `${project_url}?userId=${userId}`;
  vExecute('api-proxy', JSON.stringify({
    data: {
      api: {
        url: url,
        method: "GET",
        header: [
          "Accept: application/json",
          `Authorization: Bearer ${token}`
        ]
      }
    }
  }), "callBackUserCityInfo", "UserCityInfo");
}

// Callbacks
function RfidDataCallBack(command, data) {
  console.log("7: RfidDataCallBack function called");
  if (!user_details.AccessToken) {
    let rfidCode = JSON.parse(data).response.text;
    showLoader();
    getAccessToken(rfidCode, ApiGetAccessToken);
  } return;
}

async function callBackRefreshTockenInfo(command, data) {
  console.log("26: callBackRefreshTockenInfo");
  console.log(data);
  let res;
  try {
    res = typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    if (pendingRefreshReject) pendingRefreshReject("parse error");
    pendingRefreshResolve = null;
    pendingRefreshReject = null;
    UserLogOut();
    return;
  }
  let newToken = null;
  try {
    if (res.response?.data) {
      newToken = typeof res.response.data === "string"
        ? JSON.parse(atob(decodeURIComponent(res.response.data)))
        : res.response.data;
    } else {
      newToken = res.response;
    }
  } catch (e) {
    newToken = null;
  }
  if (!newToken || res.status !== "success") {
    console.log("Refresh failed — logging out once");
    if (pendingRefreshReject) pendingRefreshReject("refresh failed");
    pendingRefreshResolve = null;
    pendingRefreshReject = null;
    UserLogOut();
    return;
  }
  // Success
  user_details.AccessToken = newToken;
  console.log("user_details.AccessToken", user_details.AccessToken);
  updateUserLoginInfo(local_storage_key, user_details);
  console.log("Token refreshed successfully");
  if (pendingRefreshResolve) pendingRefreshResolve(newToken);
  pendingRefreshResolve = null;
  pendingRefreshReject = null;
}

function renderTestInfoCards(containerId, tests = []) {
  console.log("48: renderTestInfoCards function called");
  document.getElementById('batch_test_list').style.display = 'block';
  let list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = "";
  if (!Array.isArray(tests) || tests.length === 0) {
    list.innerHTML = `<div class="text-center text-muted p-3">No Test Found</div>`;
    return;
  }
  let test_row_ele = '';
  tests.forEach(test => {
    test_row_ele = test_row_ele + `<div class="row mx-0 px-3 py-2" style = "border-bottom: 1px solid ;" onClick="selectTestName('${test.Name}')">
              <div class="col-10"data-testid="${test.name}">${test.Name}</div>
              <div class="col-2" style="align-content: center;">
                <div class="scan-btn px-2 py-1" data-testid="${test.Id}"><i class="bi bi-upc-scan me-2"></i>Scan</div>
              </div>
            </div>`
  });
  console.log("Data test id", SelectedInstituteTestId);
  list.innerHTML = test_row_ele;
  hideLoader();
}

function selectTestName(name) {
  console.log("49:selectTestName function called", name);
  document.getElementById("selected_test_id").textContent = name;
}

function uploadOmrSheet(testId) {
  console.log("50: uploadOmrSheet");
  const batchSelect = document.getElementById("batch_list_evaluate");

  SelectedInstituteTestId = testId;
  SelectedBatchForTestsId = batchSelect.value;
  SelectedBatchName = batchSelect.options[batchSelect.selectedIndex].text;

  showLoader();
  getTestConfigForBatch(user_details.AccessToken, SelectedInstituteTestId, SelectedBatchForTestsId, ApiGetTestConfigForBatch, "OMR");
}

function renderDashbordHeader(data) {
  console.log("51: renderDashbordHeader function called");
  console.log(data);
  if (!data) return;
  let mobile = data.Mobile || user_details.Mobile;
  let email = data.EmailId || user_details.EmailId;
  let detail = "";
  if (mobile && email) {
    detail = `${mobile} , ${email}`;
  } else if (mobile) {
    detail = mobile;
  } else if (email) {
    detail = email;
  }
  let elements = document.getElementsByClassName("user_name");
  for (let el of elements) {
    el.innerText = data.User?.Name || user_details.UserName || "Unknown";
  }
  document.getElementById("user_DOB").innerText = data.DateOfBirth || "YYYY-MM-DD";
  document.getElementById("user_city").innerText = user_details.cityInfo?.[data.CityId] || "-- --";
  let gender = user_gender_info[data.GenderId] || {};
  document.getElementById("user_gender").innerText = gender.title || "-- --";
  document.getElementById("user_gender_icon").src = gender.icon_url || "https://static.virtubox.io/catalog/file/20260320-052143-9k86-male.png";
  document.getElementById("user_per_detail").innerText = detail || "-- --";
  hideLoader();
}

// options rendering
function show_perf_slide() {
  console.log("55: show_perf_slide function called");
  modifiedBatchSubjectObj = structuredBatchObj(batch_sub_obj);
  showBatchesOption('batch_list_perf');
}

// Callbacks
async function callBackIsUserLogin(command, data) {
  console.log("callBackIsUserLogin");
  console.log("data", data);
  let parsed = typeof data === "string" ? JSON.parse(data) : data;
  console.log("parsed data", parsed);
  if (parsed.status !== "success") {
    slide_change("slide_2");
    return;
  }
  let storedUser = parsed?.response?.value;
  if (!storedUser || !storedUser.AccessToken || !storedUser.UserId) {
    return;
  }
  if (isValidUser) return;
  console.log(user_details)
  user_details = storedUser;
  await kioskData();
  if (!user_details?.AccessToken || !user_details?.UserId) {
    console.log("User cleared after kiosk check");
    return;
  }
  loginTime = Array.isArray(user_details.loginTime) ? user_details.loginTime : [];
  user_id = storedUser.UserId;
  user_name = storedUser.UserName;
  isValidUser = true;
  let profileBtn = document.querySelector('.profile_btn');
  show_user_profile(profileBtn);
  const profile = user_details.profile || {};
  renderDashbordHeader({
    User: { Name: profile.User?.Name || user_details.UserName },
    EmailId: profile.EmailId || user_details.EmailId,
    Mobile: profile.Mobile || user_details.Mobile,
    DateOfBirth: profile.DateOfBirth || "-- --",
    CityId: profile.CityId || null,
    GenderId: profile.GenderId || null
  });
  batch_sub_obj = user_details.batches || [];
  renderBatchCards('user_batches', batch_sub_obj);
}

async function callBackAccessToken(command, data) {
  console.log("25:callBackAccessToken");
  let parsed = await handleApiResponse(data, () => getAccessToken(lastRfidCode, ApiGetAccessToken), false, "Login");
  if (!parsed) return;
  user_details = parsed;
  console.log("callBackAccessToken", parsed);
  user_id = parsed.UserId;
  user_name = parsed.UserName;
  isValidUser = true;
  updateUserLoginInfo(local_storage_key, user_details);
  await kioskData();
  showLoader();
  sendScriptResponse("Login", API_Status, { LoginType: loginType });
  let profileBtn = document.querySelector('.profile_btn');
  show_user_profile(profileBtn);
  getUserProfileInfo(user_details.AccessToken, user_details.UserId, ApiGetUserProfileInfo);
  getUserCityInfo(user_details.AccessToken, user_details.UserId, ApiGetUserCityInfo);
  getBatchInfo(user_details.AccessToken, user_details.UserId, ApiGetBatchInfoForTeacher);
}

async function callBackUserProfileInfo(command, data, isRetry = false) {
  console.log("27: callBackUserProfileInfo");
  let parsed = await handleApiResponse(data, isRetry ? null : () =>
    new Promise((resolve) => {
      let orig = window.callBackUserProfileInfo;
      window.callBackUserProfileInfo = (c, d) => {
        window.callBackUserProfileInfo = orig;
        handleApiResponse(d, null, true, "UserProfile").then(resolve);
      };
      getUserProfileInfo(user_details.AccessToken, user_id, ApiGetUserProfileInfo);
    }), false, "UserProfile"
  );
  if (!parsed) return;
  hideLoader();
  user_details.profile = parsed;
  updateUserLoginInfo(local_storage_key, user_details);
  sendScriptResponse("UserProfile", API_Status, { UserId: user_id });
  showLoader();
  renderDashbordHeader(parsed);
  slide_change('slide_5');
}

async function callBackUserCityInfo(command, data) {
  console.log("27: callBackUserCityInfo");
  let parsed = await handleApiResponse(data, () =>
    new Promise((resolve) => {
      let orig = window.callBackUserCityInfo;
      window.callBackUserCityInfo = (c, d) => {
        window.callBackUserCityInfo = orig;
        handleApiResponse(d, null, true, "UserCity").then(resolve);
      };
      getUserCityInfo(user_details.AccessToken, user_id, ApiGetUserCityInfo);
    }), false, "UserCity"
  );
  if (!parsed) return;
  hideLoader();
  user_details.cityInfo = {};
  parsed.forEach(c => { user_details.cityInfo[c.Id] = c.Name; });
  updateUserLoginInfo(local_storage_key, user_details);
  sendScriptResponse("UserCity", API_Status, { CityCount: parsed.length });
  showLoader();
}

function updateUserLoginInfo(local_storage_key, user_details) {
  console.log("12: updateUserLoginInfo");
  var data = {
    "key": local_storage_key,
    "value": user_details
  }
  vExecute("store_update", JSON.stringify(data), "callBackUpdateUserLogin", "updateUserLogin");
}

async function callBackBatchInfo(command, data) {
  console.log("11: callBackBatchInfo");
  let parsed = await handleApiResponse(data, () =>
    new Promise((resolve) => {
      let orig = window.callBackBatchInfo;
      window.callBackBatchInfo = (c, d) => {
        window.callBackBatchInfo = orig;
        handleApiResponse(d, null, true, "BatchInfo").then(resolve);
      };
      getBatchInfo(user_details.AccessToken, user_details.UserId, ApiGetBatchInfoForTeacher);
    }), false, "BatchInfo"
  );
  if (!parsed) return;
  hideLoader();
  user_details.batches = parsed;
  updateUserLoginInfo(local_storage_key, user_details);
  sendScriptResponse("BatchInfo", API_Status, { BatchCount: parsed.length });
  batch_sub_obj = Array.isArray(parsed) ? parsed : parsed.data;
  showLoader();
  renderBatchCards('user_batches', batch_sub_obj);
}

async function callBackCourseProgress(command, data) {
  console.log("28: callBackCourseProgress");
  let startDate = document.getElementById("course_progress_from_date").value;
  let endDate = document.getElementById("course_progress_to_date").value;
  let parsed_data = await handleApiResponse(data, null, false, "Course Progress");
  if (!parsed_data) return;
  sendScriptResponse("Course Progress", API_Status, { from: startDate, to: endDate });
  hideLoader();
  showLoader();
  let coursePeogressBtn = document.getElementById('course-progress');
  coursePeogressBtn.classList.remove("d-none");
  coursePeogressBtn.classList.add("d-flex");
  currentBatchIndex = 0;
  renderBatchTabs(parsed_data);
  renderBatchPage(parsed_data);
}

async function callBackTestInfo(command, data) {
  console.log("29: callBackTestInfo");
  let selectedBatchIdForTest = document.getElementById("batch_list_evaluate").value;
  sendScriptResponse("Scan To Evaluate", API_Status, { BatchId: selectedBatchIdForTest });
  let parsed = await handleApiResponse(data, () =>
    new Promise((resolve) => {
      let orig = window.callBackTestInfo;
      window.callBackTestInfo = (c, d) => {
        window.callBackTestInfo = orig;
        handleApiResponse(d, null, true, "Scan To Evaluate").then(resolve);
      };
      getTestInfo(user_details.AccessToken, selectedBatchIdForTest, ActivityTypeIdsEnum.INSTITUTE_TEST, ApiGetTestsForBatch);
    }), false, "Scan To Evaluate"
  );

  if (!parsed) return;
  hideLoader();
  let tests = Array.isArray(parsed) ? parsed : parsed.data || [];
  showLoader();
  renderTestInfoCards('test_list', tests);
}

async function callBackGetTestConfig(command, data) {
  console.log("callBackGetTestConfig", data);
  let parsed = await handleApiResponse(data, null, false, "Scan to Evaluate (TestConfig)");
  console.log("parsed config response", parsed);
  if (!parsed) {
    toastr.error("Test Config API Failed");
    return;
  }
  console.log("testConfigApi", parsed);

  // previous check before production schema change, commented out for future reference
  // if (parsed.Status === 2 && parsed.ReaderConfig) {
  //   console.log("OMR Config Found", parsed);
  //   toastr.success("Test Config Loaded Successfully");
  //   sendScriptResponse("Scan to Evaluate (TestConfig)", API_Status, { testId: SelectedInstituteTestId, batchId: SelectedBatchForTestsId, Response: 'Test Config Loaded Successfully' });
  //   window.CurrentOMRConfig = parsed;
  //   slide_change('slide_8');
  // } else {
  //   toastr.error("Valid OMR Asset not found for processing OMRs");
  //   console.log("Invalid OMR Config", parsed);
  // }
  if (parsed.Status === 2 && (parsed.ReaderConfig || parsed.DownloadUrl)) {
    console.log("OMR Config Found", parsed);
    toastr.success("Test Config Loaded Successfully");
    sendScriptResponse("Scan to Evaluate (TestConfig)", API_Status, {
      testId: SelectedInstituteTestId,
      batchId: SelectedBatchForTestsId,
      Response: 'Test Config Loaded Successfully'
    });
    window.CurrentOMRConfig = parsed;
    slide_change('slide_8');
  } else {
    toastr.error("Valid OMR Asset not found for processing OMRs");
    console.log("Invalid OMR Config", parsed);
  }
}

async function callBackBatchPerformanceStudentWise(command, data) {
  console.log("30: callBackBatchPerformanceStudentWise");
  let parsed = await handleApiResponse(data, () =>
    new Promise((resolve) => {
      let orig = window.callBackBatchPerformanceStudentWise;
      window.callBackBatchPerformanceStudentWise = (c, d) => {
        window.callBackBatchPerformanceStudentWise = orig;
        handleApiResponse(d, null, true, "Student Performance(StudentWise_Analysis)").then(resolve);
      };
      getBatchPerformanceStudentWise(
        user_details.AccessToken,
        document.getElementById('batch_list_perf').value,
        document.getElementById('user_batches_sub').value,
        ApiGetBatchPerformanceStudentwise
      );
    }), false, "Student Performance(StudentWise_Analysis)"
  );
  if (!parsed) return;
  let selected_batch = document.getElementById('batch_list_perf');
  let selected_subject = document.getElementById('user_batches_sub');
  sendScriptResponse("Student Performance(StudentWise_Analysis)", API_Status, { batch: selected_batch.value, subject: selected_subject.value });
  subject_wise_batch_per_obj = parsed;
  if (parsed.filters && Object.keys(parsed.filters).length > 0) {
    createFilterList(parsed);
  }
}

async function callBackBatchPerformanceOverview(command, data) {
  console.log("31: callBackBatchPerformanceOverview");
  console.log("callBackBatchPerformanceOverview", data);
  let parsed = await handleApiResponse(data, () =>
    new Promise((resolve) => {
      let orig = window.callBackBatchPerformanceOverview;
      window.callBackBatchPerformanceOverview = (c, d) => {
        window.callBackBatchPerformanceOverview = orig;
        handleApiResponse(d, null, true).then(resolve);
      };
      GetBatchPerformanceOverview(user_details.AccessToken, document.getElementById('batch_list_perf').value, document.getElementById('user_batches_sub').value, ApiGetBatchPerformanceOverview);
    }), false, "Student Performance(Overview_Analysis)"
  );

  if (!parsed) return;
  let selected_batch = document.getElementById('batch_list_perf');
  let selected_subject = document.getElementById('user_batches_sub');
  sendScriptResponse("Student Performance(Overview_Analysis)", API_Status, { batch: selected_batch.value, subject: selected_subject.value });
  hideLoader();
  resetContainer();
  setConatinerValue('report_heading', 'Overview Analysis');
  showLoader();
  renderBatchWiseOverviewCards("accordian_report", parsed.data || parsed);
}

async function callBackBatchPerformanceChapterWise(command, data) {
  console.log("32: callBackBatchPerformanceChapterWise");
  let parsed = await handleApiResponse(data, () =>
    new Promise((resolve) => {
      let orig = window.callBackBatchPerformanceChapterWise;
      window.callBackBatchPerformanceChapterWise = (c, d) => {
        window.callBackBatchPerformanceChapterWise = orig;
        handleApiResponse(d, null, true, "Student Performance(Chapter_Wise_Analysis)").then(resolve);
      };
      GetBatchPerformanceChapterWise(user_details.AccessToken, document.getElementById('batch_list_perf').value, document.getElementById('user_batches_sub').value, ApiGetBatchPerformanceChapterwise);
    }), false, "Student Performance(Chapter_Wise_Analysis)"
  );
  let selected_batch = document.getElementById('batch_list_perf');
  let selected_subject = document.getElementById('user_batches_sub');
  sendScriptResponse("Student Performance(Chapter_Wise_Analysis)", API_Status, { batch: selected_batch.value, subject: selected_subject.value });
  if (!parsed) return;
  hideLoader();
  subject_wise_batch_per_obj = parsed;
  resetContainer();
  showLoader();
  createChapterFilterList(parsed);
}

async function callBackOmrUploadUrlInfo(command, data) {
  console.log("33: callBackOmrUploadUrlInfo");
  let parsed = await handleApiResponse(data, null, false, "OmrUploadUrl");
  hideLoader();
  if (!parsed) return;
  AzureOmrUploadShortUrl = parsed.url;
  Sas_Token = parsed.sasToken;
  FileUUID = parsed.fileUUID;
  sendScriptResponse("OmrUploadUrl", API_Status, { FileUUID: parsed.fileUUID });
  showLoader();
  uploadFileToAzure(fileBlob, AzureOmrUploadShortUrl, Sas_Token, FileUUID);
}

async function uploadFileToAzure(fileBlob, AzureOmrUploadShortUrl, Sas_Token, FileUUID) {
  console.log("34: azure function called", AzureOmrUploadShortUrl)
  try {
    let UpdatedAzureOmrUploadShortUrl = AzureOmrUploadShortUrl.replace(/^~+/, '').replace(/^\/+/, '');
    AzureFullUrl = `${AzureBaseUrl}/${UpdatedAzureOmrUploadShortUrl}`;
    console.log("full AzureFullUrl", AzureFullUrl);
    let headers = {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": fileBlob.type,
    };
    let config = { headers: headers };
    await axios.put(`${AzureFullUrl}?${Sas_Token}&${FileUUID}`, fileBlob, config);
    toastr.success("OMR Upload Step 2/3 Done");
    showLoader();
    getSubmitOmrUploadResponse(user_details.AccessToken, SelectedInstituteTestId, SelectedBatchForTestsId, "application/pdf", UpdatedAzureOmrUploadShortUrl, FileUUID, ApiSubmitOmrProcessing);
    console.log("getSubmitOmrUploadResponse function called");
  } catch (error) {
    console.error("Error uploading file to Azure Blob Storage:", error);
    return false;
  }
  return true;
}

async function callBackSubmitOmrUplod(command, data) {
  console.log("35: callBackSubmitOmrUplod");
  let parsed = await handleApiResponse(data, null, false, "Submit OMR Upload");
  if (!parsed) return;
  Stages.push("Omr Uplod Status :", parsed);
  let url = (AzureFullUrl || "").replace(/\\\//g, "/");
  console.log("Clean URL:", url);
  sendScriptResponse("Upload Omr", API_Status, {
    batchId: SelectedBatchForTestsId,
    testId: SelectedInstituteTestId,
    totalOMR: capturedBuffers.length,
    uploadUrl: url
  });
  hideLoader();
  toastr.success("OMR Upload Completed");
  document.getElementById('modal-title').innerText = "";
  document.getElementById('modal_body').innerText = "OMR Images Uploaded Successfully";
  document.getElementById('modal-footer').style.display = 'none';
  new bootstrap.Modal(document.getElementById('delete_confirmModal')).show();
  resetOmrModule();
}

async function callBackUpdateUserLogin(command, data, uid) {
  console.log("37: callBackUpdateUserLogin");
  res = JSON.parse(data);
  console.log(res);
  if (res.status !== "success") {
    user_details = {};
    toastr.error("Error occured");
  } else {
    console.log(res);
    console.log(typeof (res));
  }
}

function renderBatchCards(containerId, data = [], variant = "") {
  console.log("52: renderBatchCards");
  hideLoader();
  if (containerId == "accordian_report") {
    document.getElementById('filter_list').style.display = 'none';
    setConatinerValue('report_heading', 'Batches');
    document.getElementById('chapter_wise_filter').style.display = 'block';
  }
  let container = document.getElementById(containerId);
  if (!Array.isArray(data) || !data.length) {
    container.innerHTML = `<div class="alert alert-warning m-0">No Data Found</div>`;
    return;
  }
  let modified_subject_json = {};
  data.forEach(item => {
    let subjectId = item.Subject.Id;
    if (!modified_subject_json[subjectId]) {
      modified_subject_json[subjectId] = {
        SubjectName: item.Subject.Name,
        SubjectId: item.Subject.Id,
        Batches: [],
        SubjectIcon: getSubjectIconUrl(item.Subject.Name, true),
      };
    }
    modified_subject_json[subjectId].Batches.push({
      BatchName: item.Batch.Name,
      BatchId: item.Batch.Id,
      SubjectId: item.Subject.Id,
      TotalStudents: item.TotalStudents
    });
  });
  container.innerHTML = Object.values(modified_subject_json).map((subject, index, arr) => `
          <div class="mb-0" id="user_subject">
            <h5 class="text-start mb-2">${subject.SubjectName}</h5>
            <div class="row pb-2 px-3">
              ${subject.Batches.map(batch => `
                <div class="${variant === 'large' ? 'col-4' : 'col-3'} px-2 mb-1">
                  <div class="card shadow-sm mb-0 py-1" style="border: 1px solid #DEDEDE; overflow: hidden;" onclick="renderStudentPreformance(${batch.BatchId}, ${batch.SubjectId})">
                    <div class="card-body py-2">
                      <div class="row">
                        <div class="col-8">
                          <div class="card-title" style ="font-size:1vw">${batch.BatchName}</div>
                          <small class="bi bi-people-fill pe-1"></small>
                          <span>${batch.TotalStudents}</span>
                        </div>
                        <div class="col-4 flex-end">
                          <img class="batch_icon" src="${subject.SubjectIcon}"" alt="error">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
            ${index !== arr.length - 1
      ? `<div class="mx-5 my-2" style="height:1px; background-color:#DEDEDE;"></div>`
      : ""
    }
          </div>
        `).join("");
  hideLoader();
}

function renderStudentPreformance(batchId, subjectId) {
  showLoader();
  console.log("53:renderStudentPreformance");
  slide_change('slide_6');
  modifiedBatchSubjectObj = structuredBatchObj(batch_sub_obj);
  showBatchesOption('batch_list_perf');
  document.getElementById("batch_list_perf").value = batchId;
  document.getElementById("user_subject_list_sec").style.display = "block";
  showSubjectsOption(batchId);
  document.getElementById("user_batches_sub").value = subjectId;
  document.getElementById('stud_perf_selection_btn_container').style.display = "block";
  optionsBatchPerformanceData('GetBatchPerformanceOverview');
  let student_performance = document.querySelector('.student_performance_btn');
  selectFooter(student_performance);
  stud_perf_selection_btn_1.classList.remove("disabled_card");
  stud_perf_selection_btn_2.classList.add("disabled_card");
  stud_perf_selection_btn_3.classList.add("disabled_card");
}

// Map API colorClass values to RGB triplets (no dependency on Bootstrap's internal vars)
const COLOR_RGB_MAP = {
  primary: "13,110,253",
  secondary: "108,117,125",
  success: "25,135,84",
  danger: "220,53,69",
  warning: "255,193,7",
  info: "13,202,240",
  light: "248,249,250",
  dark: "33,37,41",
  tertiary: "23, 162, 184"
};

const DEFAULT_COLOR_RGB = COLOR_RGB_MAP.secondary;

function renderBatchWiseOverviewCards(containerId, cards = []) {
  console.log("54: renderBatchWiseOverviewCards");
  hideLoader();
  document.getElementById('filter_list').style.display = 'none';
  setConatinerValue('accordian_report', '');
  document.getElementById('chapter_wise_filter').style.display = 'block';
  console.log("renderBatchWiseOverviewCards function called");
  console.log(cards);

  let container = document.getElementById(containerId);
  if (!container) return;

  if (!Array.isArray(cards) || !cards.length) {
    container.innerHTML = `<div class="alert alert-warning">No Overview Data Found</div>`;
    return;
  }

  container.innerHTML = cards.map(item => {
    let iconUrl = getAzureUrl(`webapp/assets/icons/${item.iconName}.svg`);
    let rgb = COLOR_RGB_MAP[item.colorClass] || DEFAULT_COLOR_RGB;

    if (!COLOR_RGB_MAP[item.colorClass]) {
      console.warn(`Unknown colorClass "${item.colorClass}" — falling back to default color`);
    }
    return `<div class="col-6 mb-2 px-2 py-1">
        <div class="w-100 px-4 py-2 d-flex justify-content-between align-items-center shadow-sm" style="background: rgba(${rgb}, 0.3); border-radius: 2vh;">
          <div>
            <div class="mb-2" style="font-size:1.5vw; color:#555;">${item.title || "-"}</div>
            <div style="font-size:2vw; font-weight:400;">${item.value || "-"}</div>
          </div>
          <div>
            <i style="display:inline-block;width:11vh;height:11vh;background:url('${iconUrl}') center/contain no-repeat;"></i>
          </div>
        </div>
      </div>
    `;
  }).join("");
  hideLoader();
}

function show_perf_slide() {
  console.log("55: show_perf_slide function called");
  modifiedBatchSubjectObj = structuredBatchObj(batch_sub_obj);
  showBatchesOption('batch_list_perf');
}

function structuredBatchObj(arr) {
  console.log("57: structuredBatchObj function called");
  if (!Array.isArray(arr)) {
    console.error("Expected array but got:", arr);
    return {};
  }
  let result = arr.reduce((acc, item) => {
    let batchId = item.Batch.Id;
    if (!acc[batchId]) {
      acc[batchId] = {
        id: batchId,
        Name: item.Batch.Name,
        Subjects: {}
      };
    }
    acc[batchId].Subjects[item.Subject.Id] = {
      Id: item.Subject.Id,
      Name: item.Subject.Name
    };
    return acc;
  }, {});
  return result;
}

function showBatchesOption(ele_id) {
  console.log("58: showBatchesOption function called");
  let select = document.getElementById(`${ele_id}`);
  select.innerHTML = `<option value="">Choose Batch</option>`;
  Object.values(modifiedBatchSubjectObj).forEach(batch => {
    let option = document.createElement("option");
    option.value = batch.id;
    option.textContent = batch.Name;
    select.appendChild(option);
  }); hideLoader();
}

function showSub() {
  // document.getElementById('chapter_wise_filter').style.display = 'none';
  document.getElementById('stud_perf_selection_btn_container').style.display = 'none';
  console.log("59: showSub function called");
  let select_batch = document.getElementById("batch_list_perf").value;
  if (select_batch) {
    Student_perf_selcetd_tab = '';
    stud_perf_selection_btn_1.classList.add("disabled_card");
    stud_perf_selection_btn_2.classList.add("disabled_card");
    stud_perf_selection_btn_3.classList.add("disabled_card");
    document.getElementById("user_subject_list_sec").style.display = "block";
    showSubjectsOption(select_batch);
  } else {
    stud_perf_selection_btn_1.classList.add("disabled_card");
    stud_perf_selection_btn_2.classList.add("disabled_card");
    stud_perf_selection_btn_3.classList.add("disabled_card");
    document.getElementById("user_subject_list_sec").style.display = "none";
    Student_perf_selcetd_tab = '';
    renderBatchCards('accordian_report', batch_sub_obj, 'large');
  }
}


function showSubjectsOption(selected_batch) {
  console.log("60: showSubjectsOption function called");
  let select = document.getElementById("user_batches_sub");
  select.innerHTML = `<option value="">Choose Subject</option>`;
  Object.values(modifiedBatchSubjectObj[selected_batch].Subjects).forEach(subject => {
    let option = document.createElement("option");
    option.value = subject.Id;
    option.textContent = subject.Name;
    select.appendChild(option);
  });
}

function resetOmrModule() {
  console.log("61: reset modeule done");
  capturedBuffers = [];
  fileBlob = null;
  PdfFileChecksum = '';
  setConatinerValue('omr_preview_gallery', '');
  setConatinerValue('capture_omr_btn', 'Capture OMR');
  document.getElementById('delete_all_omr_images').style.display = "none";
  document.getElementById('capture_omr_btn').style.display = "none";
  document.getElementById('upload_omr_btn').classList.add("upload_omr_btn");
  stopCamera();
}

// async function startCamera() {
//   if (stream && video.srcObject)return;
//   flash(true);
//   console.log("62: startCamera");
//   Stages.push("startCamera");
//   document.getElementById('omr_scanning_button').style.display = "none";
//   document.getElementById('capture_omr_btn').style.display = "block";
//   let constraints = {
//     audio: false,
//     video: {
//       facingMode: { ideal: "environment" },
//       width: { ideal: 3840 },
//       height: { ideal: 2160 }
//     }
//   };
//   stream = await navigator.mediaDevices.getUserMedia(constraints);
//   video.srcObject = stream;
//   let track = stream.getVideoTracks()[0];
//   let settings = track.getSettings();
//   console.log("Actual Resolution:", settings.width, "x", settings.height);
// }
async function startCamera() {
  if (stream && video.srcObject) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia not supported in this environment");
    toastr.error("Camera access is not available in this app view. Please check app permissions / WebView settings.");
    Stages.push("startCamera_failed_no_mediaDevices");
    return;
  }

  flash(true);
  console.log("62: startCamera");
  Stages.push("startCamera");
  document.getElementById('omr_scanning_button').style.display = "none";
  document.getElementById('capture_omr_btn').style.display = "block";

  let constraints = {
    audio: false,
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 3840 },
      height: { ideal: 2160 }
    }
  };

  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    let track = stream.getVideoTracks()[0];
    let settings = track.getSettings();
    console.log("Actual Resolution:", settings.width, "x", settings.height);
  } catch (err) {
    console.log("getUserMedia failed:", err);
    toastr.error("Could not access camera: " + err.message);
    Stages.push("startCamera_error");
  }
}

function stopCamera() {
  flash(false);
  Stages.push("stopCamera");
  console.log("63: stopCamera");
  document.getElementById('omr_scanning_button').style.display = "block";
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  video.pause();
  video.srcObject = null;
  video.removeAttribute("src");
  video.load();
}


async function captureOmrImage() {
  console.log("64: captureOmrImage");
  if (!stream || video.videoWidth === 0) { toastr.error("Camera not ready"); return; }
  showLoader();
  let vw = video.videoWidth;
  let vh = video.videoHeight;
  let videoRect = video.getBoundingClientRect();
  let guideRect = document.querySelector(".omr-guide-frame").getBoundingClientRect();
  let sx = ((guideRect.left - videoRect.left) / videoRect.width) * vw;
  let sy = ((guideRect.top - videoRect.top) / videoRect.height) * vh;
  let sw = (guideRect.width / videoRect.width) * vw;
  let sh = (guideRect.height / videoRect.height) * vh;
  let rw = Math.round(sw);
  let rh = Math.round(sh);
  canvas.width = rh;
  canvas.height = rw;
  let ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(90 * Math.PI / 180);
  ctx.drawImage(video, sx, sy, sw, sh, -rw / 2, -rh / 2, rw, rh);
  ctx.restore();
  let blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.85));
  let buffer = await blob.arrayBuffer();
  capturedBuffers.push(buffer);
  let index = capturedBuffers.length - 1;
  preview.insertAdjacentHTML("afterbegin", `
      <div class="position-relative omr-item mx-2 mb-2" data-index="${index}">
        <img src="${URL.createObjectURL(blob)}" class="rounded w-100">
        <button class="position-absolute top-0 start-0 m-1 d-flex align-items-center justify-content-center"
        style=" border:none; background:white; color:#000; border-radius:50%; width:30px; height:30px; z-index:2; "onclick="openPreviewModal('${URL.createObjectURL(blob)}')"><i class="bi bi-eye"></i>
        </button>
        <button
          class="bi bi-trash position-absolute top-0 end-0 m-1"
          style="border:none; background:white; color:red; border-radius:50%; width:30px; height:30px;"
          onclick="deleteOmrImage(${index}, this)">
        </button>
      </div>`);
  setConatinerValue('capture_omr_btn', 'Capture Again');
  document.getElementById('upload_omr_btn').classList.remove("upload_omr_btn");
  document.getElementById('delete_all_omr_images').style.display = 'block';
  toastr.success("Image Captured Successfully");
  hideLoader();
}

function deleteOmrImage(index, btn) {
  deleteType = "single";
  deleteIndex = index;
  deleteButtonRef = btn;
  document.getElementById('modal-title').innerText = "Confirm Delete";
  document.getElementById('modal_body').innerText = "Are you sure you want to delete this OMR image?";
  document.getElementById('confirmBtn').innerText = "Delete";
  document.getElementById('modal-footer').style.display = 'block';
  confirmAction = () => confirmDeletingBtn('single');
  new bootstrap.Modal(document.getElementById('delete_confirmModal')).show();
}

function deleteAllOmrImg() {
  deleteType = "all";
  document.getElementById('modal-title').innerText = "Confirm Delete";
  document.getElementById('modal_body').innerText = "Are you sure you want to delete ALL captured OMR images?";
  document.getElementById('confirmBtn').innerText = "Delete";
  document.getElementById('modal-footer').style.display = 'block';
  confirmAction = () => confirmDeletingBtn('all');
  new bootstrap.Modal(document.getElementById('delete_confirmModal')).show();
}

function CallOmrConfig() {
  document.getElementById('modal-title').innerText = "Confirm Upload";
  document.getElementById('modal_body').innerText = "Are you sure you want to upload OMR image?";
  document.getElementById('confirmBtn').innerText = "Upload";
  document.getElementById('modal-footer').style.display = 'block';
  confirmAction = confirmUploadOmr;
  new bootstrap.Modal(document.getElementById('delete_confirmModal')).show();
}

function openLogoutModal() {
  document.getElementById('modal-title').innerText = "Confirm Logout";
  document.getElementById('modal_body').innerText = "Are you sure you want to logout?";
  document.getElementById('confirmBtn').innerText = "Logout";
  document.getElementById('modal-footer').style.display = 'block';
  confirmAction = UserLogOut;
  new bootstrap.Modal(document.getElementById('delete_confirmModal')).show();
}

document.addEventListener("DOMContentLoaded", () => {
  let btn = document.getElementById("confirmBtn");
  if (btn) {
    btn.onclick = function () {
      if (typeof confirmAction === "function") {
        confirmAction();
        confirmAction = null;
        document.activeElement.blur();
        bootstrap.Modal.getInstance(document.getElementById('delete_confirmModal')).hide();
      }
    };
  }
});

function confirmDeletingBtn() {
  console.log("67: confirmDeletingBtn");
  document.getElementById('modal-title').innerText = "Confirm Delete";
  if (deleteType === "single") {
    capturedBuffers.splice(deleteIndex, 1);
    deleteButtonRef.closest(".omr-item").remove();
    toastr.success("Image deleted successfully");
    document.getElementById('upload_omr_btn').classList.remove("upload_omr_btn");
    checkIfGalleryEmpty();
  }

  if (deleteType === "all") {
    capturedBuffers = [];
    setConatinerValue('omr_preview_gallery', '');
    toastr.success("All images deleted successfully");
    checkIfGalleryEmpty();
  }
  deleteType = null;
  deleteIndex = null;
  deleteButtonRef = null;
  bootstrap.Modal.getInstance(document.getElementById('delete_confirmModal')).hide();
}

async function generateOmrPDF() {
  console.log("68: generateOmrPDF");
  if (!capturedBuffers.length) {
    console.log("No images captured");
    return;
  }
  let { jsPDF } = window.jspdf;
  let pdf = new jsPDF({ unit: "mm", format: "a4" });
  for (let i = 0; i < capturedBuffers.length; i++) {
    let blob = new Blob([capturedBuffers[i]]);
    let img = new Image();
    img.src = URL.createObjectURL(blob);
    await img.decode();
    let pageWidth = pdf.internal.pageSize.getWidth();
    let pageHeight = pdf.internal.pageSize.getHeight();
    let imgWidth = pageWidth;
    let imgHeight = (img.height * imgWidth) / img.width;
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = (img.width * imgHeight) / img.height;
    }
    let x = (pageWidth - imgWidth) / 2;
    let y = (pageHeight - imgHeight) / 2;
    if (i !== 0) pdf.addPage();
    pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight, "", "FAST");
  }
  fileBlob = pdf.output("blob");
  Stages.push('generatedOmrPDF');
  return fileBlob;
}

function generateChecksum() {
  console.log("69: generateChecksum");
  Stages.push('generatedChecksum');
  let spark = new SparkMD5.ArrayBuffer();
  capturedBuffers.forEach(buf => spark.append(buf));
  return spark.end();
}

function checkIfGalleryEmpty() {
  console.log("70: checkIfGalleryEmpty");
  if (capturedBuffers.length === 0) {
    setConatinerValue('omr_preview_gallery', '');
    document.getElementById("omr_preview_gallery").innerHTML = "";
    document.getElementById('delete_all_omr_images').style.display = "none";
    document.getElementById('capture_omr_btn').style.display = "none";
    setConatinerValue('capture_omr_btn', 'Capture OMR');
    document.getElementById('upload_omr_btn').classList.add("upload_omr_btn");
    fileBlob = null;
    PdfFileChecksum = '';
    stopCamera();
  }
}

function createFilterList(response) {
  showLoader();
  console.log("71 :createFilterList");
  let filters = response.filters;
  document.getElementById('chapter_wise_filter').style.display = 'block';
  let filterContainer = document.getElementById("filter_list");
  filterContainer.innerHTML = "";
  Object.entries(response.filters).forEach(([key, filter]) => {
    let span = document.createElement("span");
    span.className = "perf_filters px-3 py-1 me-2";
    span.textContent = filter.displayName;
    span.dataset.filterKey = key;
    if (filter.isDefault) {
      showLoader();
      span.classList.add("selected_filter");
      setTimeout(() => {
        applyFilter(key);
      }, 0)

    }
    filterContainer.appendChild(span);
  });
}

function createChapterFilterList(response) {
  console.log("72: createChapterFilterList");
  const filters = response?.filters;
  if (!filters || !Object.keys(filters).length) {
    setConatinerValue('accordian_report', '<div class="alert alert-warning">No data found</div>');
    hideLoader(); return;
  }
  document.getElementById('chapter_wise_filter').style.display = 'block';
  console.log("createChapterFilterList");
  let container = document.getElementById("filter_list");
  container.innerHTML = "";
  Object.entries(response.filters).forEach(([key, filter]) => {
    let span = document.createElement("span");
    span.className = "perf_filters px-3 py-1 me-2";
    span.textContent = filter.displayName;
    span.dataset.filterKey = key;
    if (filter.isDefault) {
      showLoader();
      span.classList.add("selected_filter");
      setTimeout(() => {
        applyChapterFilter(key);
      }, 0)

    }
    container.appendChild(span);
  });
  hideLoader();
}

function applyFilter(filterKey) {
  console.log("73: applyFilter")
  document.getElementById('filter_list').style.display = 'block';
  setConatinerValue('report_heading', 'View Student Wise Analysis');
  let orderArray = subject_wise_batch_per_obj.filters[filterKey].order;
  let cardMap = {};
  subject_wise_batch_per_obj.cards.forEach(card => {
    cardMap[card.cardInfo.Id] = card;
  });
  let orderedCards = orderArray.map(id => cardMap[id]).filter(card => card);
  renderCards(orderedCards);
}

function applyChapterFilter(filterKey) {
  document.getElementById('filter_list').style.display = 'block';
  console.log("74: apply chapter filter");
  setConatinerValue('report_heading', 'View chapter Wise Analysis');
  let order = subject_wise_batch_per_obj.filters[filterKey].order;
  let cardMap = {};
  subject_wise_batch_per_obj.cards.forEach(c => {
    cardMap[c.cardInfo.Id] = c;
  });
  let orderedCards = order.map(id => cardMap[id]).filter(Boolean);
  showLoader();
  renderChapterCards(orderedCards);
}

function renderCards(cardArray) {
  console.log("75: renderCards");
  let accordionContainer = document.getElementById("accordian_report");
  accordionContainer.innerHTML = "";
  cardArray.forEach((card, index) => {
    let id = card.cardInfo.Id;
    let name = card.cardInfo.Name;
    let gauge = card.gaugeValue || 0;
    let accordionItem = `
      <div class="col-12 mb-3">
        <div class="accordion-item shadow-sm h-100">
          <h2 class="accordion-header" id="heading${id}">
              <button class="accordion-button collapsed bg-white"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse${id}"
                      aria-expanded="false">
                  <div class="d-flex justify-content-between align-items-center w-100">
                      <div>
                          ${index + 1}. ${name}
                      </div>
                      <div style="width:120px">
                          <div class="progress" style="height:8px;">
                              <div class="progress-bar"style=" width:${gauge * 100}%; background-color:${getProgressBarColor(gauge * 100)};
                                ">
                            </div>
                          </div>
                      </div>
                  </div>
              </button>
          </h2>
          <div id="collapse${id}"class="accordion-collapse collapse" data-bs-parent="#accordian_report">
              <div class="accordion-body">
                  <div class="row">
                      ${card.metrics.map(metric => `
                          <div class="col text-center" style="color:${metric.color}">
                              <i class="bi bi-${metric.icon}"></i>
                              <strong>${metric.value}</strong>
                          </div>
                      `).join("")}
                  </div>
              </div>
          </div>
        </div>
      </div>
      `; accordionContainer.innerHTML += accordionItem;
  });
  hideLoader();
}

function renderChapterCards(cardArray) {
  console.log("76: renderChapterCards");
  setConatinerValue('accordian_report', '');
  let accordionContainer = document.getElementById("accordian_report");
  accordionContainer.innerHTML = "";
  accordionContainer.classList.add("row");
  cardArray.forEach((card, index) => {
    let id = card.cardInfo.Id;
    let name = card.cardInfo.Name;
    let gauge = card.gaugeValue || 0;
    accordionContainer.innerHTML += `
        <div class="col-12 mb-3">
          <div class="accordion-item shadow-sm h-100">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed bg-white" data-bs-toggle="collapse" data-bs-target="#ch${id}">
                <div class="d-flex justify-content-between w-100 align-items-center">
                  <div>${index + 1}. ${name}</div>
                  <div style="width:120px">
                    <div class="progress" style="height:8px;">
                      <div class="progress-bar"style=" width:${gauge * 100}%; background-color:${getProgressBarColor(gauge * 100)};"></div>
                    </div>
                  </div>
                </div>
              </button>
          </h2>
          <div id="ch${id}" class="accordion-collapse collapse" data-bs-parent="#accordian_report">
            <div class="accordion-body">
              <div class="row">
                ${card.metrics.map(m => `
                  <div class="col text-center" style="color:${m.color}">
                    <i class="bi bi-${m.icon}"></i>
                    <strong>${m.value}</strong>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
  });
  hideLoader();
}


async function handleApiResponse(rawData, retryCallBack = null, hasRetried = false, serviceName = "API") {
  console.log("82: handleApiResponse");
  let res;
  try {
    res = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
  } catch (e) {
    toastr.error("Invalid API response format");
    sendScriptResponse(serviceName, "error", { ErrorMessage: "Invalid API response format" });
    hideLoader();
    return null;
  }

  API_Status = res.status || "error";
  if (res.status && res.status !== "success") {
    toastr.error(res.error || "Something went wrong");
    sendScriptResponse(serviceName, API_Status, { ErrorMessage: res.error || "Something went wrong" });
    hideLoader();
    return null;
  }

  let parsedData;
  try {
    parsedData = res.response?.data
      ? (typeof res.response.data === "string" ? JSON.parse(atob(decodeURIComponent(res.response.data))) : res.response.data)
      : (res.response || res);
  } catch (e) {
    toastr.error("Response decoding failed");
    sendScriptResponse(serviceName, "error", { ErrorMessage: "Response decoding failed" });
    hideLoader();
    return null;
  }

  if (parsedData?.status === "error") {
    let msg = parsedData.error || parsedData.message || "Something went wrong";
    toastr.error(msg);
    sendScriptResponse(serviceName, "error", { ErrorMessage: msg });
    hideLoader();
    return null;
  }

  if (parsedData?.detail === "Invalid or expired token." || parsedData?.detail === "Not authenticated") {
    if (hasRetried || !retryCallBack) {
      sendScriptResponse(serviceName, "error", { ErrorMessage: "Token refresh failed" });
      return null;
    }
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => { isRefreshing = false; });
    }
    try {
      await refreshPromise;
    } catch (err) {
      sendScriptResponse(serviceName, "error", { ErrorMessage: "Token refresh failed" });
      hideLoader();
      UserLogOut();
      return null;
    }
    return await retryCallBack(true);
  }

  if (Array.isArray(parsedData?.detail)) {
    let msg = parsedData.detail.map(d => d.msg).join(", ");
    toastr.error(msg);
    sendScriptResponse(serviceName, "error", { ErrorMessage: msg });
    hideLoader();
    return null;
  }

  if (typeof parsedData?.detail === "string") {
    toastr.error(parsedData.detail);
    sendScriptResponse(serviceName, "error", { ErrorMessage: parsedData.detail });
    hideLoader();
    return null;
  }

  hideLoader();
  return parsedData;
}

async function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    pendingRefreshResolve = resolve;
    pendingRefreshReject = reject;
    console.log("Calling refresh token API...");
    let RefreshToken = (user_details.RefreshToken || "").trim();
    getRefreshTockenInfo(RefreshToken, ApiGetRefreshToken);
  });
}

function renderBatchTabs(data) {
  console.log("85: renderBatchTabs");
  let container = document.getElementById("course_progress_batches");
  container.style.display = 'block';
  container.innerHTML = "";
  data.forEach((batch, index) => {
    let btn = document.createElement("button");
    btn.className = "batch-tab";
    if (index === 0) btn.classList.add("active");
    btn.textContent = batch.Batch.Name;
    btn.addEventListener("click", () => {
      currentBatchIndex = index;
      document.querySelectorAll(".batch-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderBatchPage(data);
    });
    container.appendChild(btn);
  }); hideLoader();
}

function buildRingSVG(completed, total, color) {
  console.log("86: buildRingSVG");
  let pct = total > 0 ? Math.min(completed / total, 1) : 0;
  let r = 20;
  let circ = 2 * Math.PI * r;
  let dash = pct * circ;
  return `
          <svg class="ring-svg" width="52" height="52" viewBox="0 0 52 52">
            <circle class="track" cx="26" cy="26" r="${r}"></circle>
            <circle class="fill"
              cx="26"
              cy="26"
              r="${r}"
              stroke="${color}"
              stroke-dasharray="${dash} ${circ}"
              transform="rotate(-90 26 26)">
            </circle>
            <text x="26" y="30" text-anchor="middle">${Math.round(pct * 100)}%</text>
          </svg>
        `;
}

function buildPeriodSection(label, data, bgColor) {
  console.log("87: buildPeriodSection");

  let stats = ["Chapters", "Lectures", "Assignments", "Assessments"];

  let statsHTML = stats.map(key => {
    let completed = data[key]?.Completed || 0;
    let total = data[key]?.Total || 0;

    let progress =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    let ringColor = getProgressBarColor(progress);

    return `
        <div class="text-center flex-fill">
          ${buildRingSVG(completed, total, ringColor)}
          <div class="small fw-semibold text-secondary">${key}</div>
          <div class="fw-bold small">${completed}/${total}</div>
        </div>
      `;
  }).join("");

  return `
      <div class="rounded-3 border px-3 py-2 mt-2" style="background:${bgColor};">
        <div class="fw-bold small mb-2 d-flex align-items-center gap-2">
          ${label}
        </div>
        <div class="d-flex gap-2">
          ${statsHTML}
        </div>
      </div>
    `;
}

function renderBatchPage(data) {
  console.log('88: renderBatchPage');
  let batch = data[currentBatchIndex];
  let container = document.getElementById("course_progress_cards");
  container.style.display = 'block';
  container.innerHTML = "";
  batch.Subjects.forEach((subject, idx) => {
    let statusText = subject?.FullYear?.ProgressStatus || "Unknown";
    let statusStyle = getStatusClass(statusText);
    let status = STATUS_MAP[statusText] || {};
    let bodyId = `card-body-${idx}`;
    let initial = subject?.Subject?.Name?.charAt(0) || "?";
    let teacherStr = subject.Teacher
      ? `<i class="bi bi-person-fill me-1"></i>${subject.Teacher.Name}`
      : `<i class="bi bi-exclamation-circle me-1 text-warning"></i>Not Assigned`;
    let card = document.createElement("div");
    card.innerHTML = `
        <div class="card shadow-sm rounded-4 border mb-3 overflow-hidden">
          <button class="btn bg-light w-100 text-start border-0 px-3 py-2"
                  data-bs-toggle="collapse"
                  data-bs-target="#${bodyId}">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-3">
                <!-- Icon (unchanged logic) -->
                <div class="rounded-3 d-flex align-items-center justify-content-center fw-bold"
                    style="width:40px;height:40px;background:${status.iconBg};color:${status.iconColor};">
                  ${initial}
                </div>
                <div>
                  <div class="fw-bold">${subject.Subject.Name}</div>
                  <small class="text-muted">${teacherStr}</small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge rounded-pill px-3 py-2"style=" background:${statusStyle.bg};color:${statusStyle.text};">${statusText}</span>
                <i class="bi bi-chevron-down chevron"></i>
              </div>
            </div>
          </button>

          <div id="${bodyId}" class="collapse px-3 pb-3 pt-2">
            ${buildPeriodSection("Selected Period", subject.SelectedPeriod, "#f0fdf4")}
            ${buildPeriodSection("Full Year", subject.FullYear, "#fff7ed")}
          </div>
        </div>`;
    container.appendChild(card);
  });
  hideLoader();
}

function closeCourseProgress() {
  console.log("89: closeCourseProgress");
  let slide = document.querySelector('.slide_9');
  if (slide) slide.style.display = 'none';
  document.getElementById('course_progress_batches').innerHTML = "";
  document.getElementById('course_progress_batches').style.display = 'none';
  document.getElementById('course_progress_cards').innerHTML = "";
  document.getElementById('course_progress_cards').style.display = 'none';
  document.getElementById("course_progress_from_date").value = '';
  document.getElementById("course_progress_to_date").value = '';
}

function getStatusClass(status) {
  console.log("84: getStatusClass");
  if (status === "Ahead of Schedule") {
    return {
      bg: "#FFF8E7",
      border: "#F2D188",
      text: "#E1AA2D"
    };
  } else if (status === "On Schedule")
    return {
      bg: "#F3FFF3",
      border: "#BFE6BF",
      text: "#73C873"
    }; else if (status === "Behind Schedule") {
      return {
        bg: "#FFF3F3",
        border: "#F5B5B5",
        text: "#E05A5A"
      }
    }
}

function setDefaultScanToEvaluate() {
  const batchSelect = document.getElementById('batch_list_evaluate');
  if (!batchSelect || batchSelect.options.length <= 1) return;
  batchSelect.selectedIndex = 1;
  validateInfo('batch_test_list');
  console.log("setDefaultScanToEvaluate");
}

function defaultCallCourseProgress() {
  console.log("defaultCallCourseProgress");
  const now = new Date();                                          // ← real "today"
  const today = new Date(now.getFullYear(), now.getMonth(), 0);     // ← last day of previous month
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // ← 1st of previous month
  const start = formatDate(startDate);
  const end = formatDate(today);
  document.getElementById("course_progress_from_date").value = start;
  document.getElementById("course_progress_to_date").value = end;
  const el = document.getElementById("month");
  if (el) {
    document.querySelectorAll(".range-option").forEach(btn => {
      btn.classList.remove("selected_filter");
    });
    el.classList.add("selected_filter");
  }
  console.log("AffiliationId:", user_details.AffiliationId);
  showLoader();

  getCourseProgressInfo(
    user_details.AccessToken, user_details.AffiliationId, start, end, ApiGeCourseProgressInfo
  );
}

function CloseStudentPerformance() {
  console.log("79: CloseStudentPerformance");
  document.getElementById('user_subject_list_sec').style.display = "none";
  document.getElementById('stud_perf_selection_btn_container').style.display = 'none';
  document.getElementById('stud_perf_selection_btn_3').classList.add('disabled_card');
  document.getElementById('stud_perf_selection_btn_2').classList.add('disabled_card');
  document.getElementById('stud_perf_selection_btn_1').classList.add('disabled_card');
  document.getElementById('chapter_wise_filter').style.display = "none";
}

function kioskData() {
  console.log("KioskData function called");
  return new Promise((resolve, reject) => {
    pendingRefreshResolve = resolve;
    pendingRefreshReject = reject;
    let data = JSON.stringify({
      command: "kiosk_info"
    });
    vExecute("kiosk-response", data, "callBackKioskData", "KioskInfo");
  });
}

async function callBackKioskData(command, data) {
  console.log("KioskData", data);
  try {
    let parsed = typeof data === "string"
      ? JSON.parse(data)
      : data;
    Kiosk_Info = parsed;
    if (!user_details?.Kiosk_Info) {
      console.log("user details. kisok info not found");
      console.log("Kioskparsed", parsed);
      user_details.Kiosk_Info = parsed;
      updateUserLoginInfo(local_storage_key, user_details);
      console.log("Kiosk stored");
    }
    if (parsed.status === "success" && pendingRefreshResolve) {
      pendingRefreshResolve(parsed);
    } else if (pendingRefreshReject) {
      pendingRefreshReject(parsed);
    }
  } catch (error) {
    if (pendingRefreshReject) pendingRefreshReject(error);
  } finally {
    pendingRefreshResolve = null;
    pendingRefreshReject = null;
  }
  checkScreeenSaver();
}

function checkScreeenSaver() {
  console.log('checkScreeenSaver');
  let kiosk = user_details?.Kiosk_Info ?? {};
  console.log("kiosk?.screensaver_uuid", kiosk?.screensaver_uuid);
  console.log("Kiosk_Info.screensaver_uuid", Kiosk_Info.screensaver_uuid);
  if (Kiosk_Info.screensaver_uuid !== kiosk?.screensaver_uuid) {
    UserLogOut();
  }
}

function sendScriptResponse(service, status, payload = {}) {
  console.log("sendScriptResponse");
  if (!Array.isArray(loginTime)) {
    loginTime = [];
  }
  if (service != 'UploadOmr') {
    Stages = [];
  }
  loginTime.push(new Date());
  user_details.loginTime = loginTime;
  updateUserLoginInfo(local_storage_key, user_details);
  let kiosk = user_details?.Kiosk_Info ?? {};
  console.log(kiosk?.kiosk_id ?? "");
  console.log(kiosk?.kiosk_title ?? "");
  try {
    let data = {
      UserID: user_details?.UserId || "",
      KioskID: kiosk.kiosk_id || "",
      KioskName: kiosk.kiosk_title || "",
      Service: service,
      SessionId: user_details?.LoginSessionId || "",
      API_Status: status || "no api call",
      EventTriggerTime: new Date().toISOString(),
      Version: version,
      Payload: payload,
      Stages: Stages
    };

    console.log("Offline Script Response:", data);
    vExecute("script-response-live", JSON.stringify(data), "", service);
  } catch (err) {
    console.error("Script response error:", err);
  }
}

function getSubjectIconUrl(subjectName, isColor) {
  if (!subjectName) { subjectName = MultiSubjectName; }
  let iconName = subjectName.replace(/\s+/g, "").toLowerCase();
  let iconType = isColor ? "color" : "wireframe";
  return getAzureUrl(`webapp/assets/icons/subjects/${iconType}/${iconName}.svg`);
}

function getAzureUrl(shortUrl) {
  shortUrl = shortUrl.replace(/^~+/, "");
  shortUrl = shortUrl.replace(/^\/~+/, "");
  let baseUrl = AzureBaseUrl.replace(/\/+$/, "");
  return `${baseUrl}/${shortUrl}`;
}

function openPreviewModal(imageSrc) {
  document.getElementById("previewModalImage").src = imageSrc;
  const modal = new bootstrap.Modal(document.getElementById("imagePreviewModal"));
  modal.show();
}

function getProgressBarColor(progressValue) {
  progressValue = Math.max(
    Math.min(progressValue, ProgressThresholds[ProgressThresholds.length - 1]),
    ProgressThresholds[0]
  );

  const closestNextIndex = ProgressThresholds.findIndex(
    (n) => n >= progressValue
  );

  return closestNextIndex >= 0 &&
    closestNextIndex < ProgressColors.length
    ? ProgressColors[closestNextIndex]
    : DefaultProgressColor;
}

function flash(power) {
  console.log("Flash function call", power);
  var payload = {
    "power": power
  };
  vExecute('flash', JSON.stringify(payload), 'flash');
}

function callbackWebviewOnDestroy() {
  console.log("callbackWebviewOnDestroy function called");
  flash(false);
}