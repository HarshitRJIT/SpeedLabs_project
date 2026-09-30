function vExecute(command, data, callback, uid) {
  console.log("44: vExecute function called");
  console.log(command, data, callback, uid);
  let tag = command + ':' + callback + ':' + uid;
  VirtuBox.execute(command, data, tag);
}

function onKioskResponse(command, data, tag) {
  console.log("45: onKioskResponse function called");
  console.log(command, data, tag);
  if (tag === "text_input_register") {
    registerEventListener("text_input", "text_input_unregister", { decode: false, unregister: true, });
  }
  else if (command === 'webview_onDestroy') {
    window['callbackWebviewOnDestroy'](command, data);
    return;
  }
  else {
    let callback = tag.split(":")[1];
    if (typeof window[callback] === 'function') {
      window[callback](command, data);
    }
  }
}