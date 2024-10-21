import { fileURLToPath } from 'url';
import { dirname } from 'path';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

function downloadBinary(filename, data) {
  var blob = new Blob([data], {type: "octet/stream"});
  var url = window.URL.createObjectURL(blob);

  var element = document.createElement('a');
  element.setAttribute('href', url);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);

  // Freigabe der Blob-URL
  window.URL.revokeObjectURL(url);
}

// Verwendung:
// var data = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
// download("test.bin", data);

export function download(filename, text) {
  if(typeof(text != 'string')){
    downloadBinary(filename, text);
  } else {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);
  }
}

