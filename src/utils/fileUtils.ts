const reader = new FileReader();

function readFile(file: File) {
  const promise = new Promise<string>((res) => {
    function readCallback() {
      reader.removeEventListener("load", readCallback);
      res(reader.result as string);
    }

    reader.addEventListener("load", readCallback);
  });

  reader.readAsText(file);
  return promise;
}

export function uploadFile(accept: string) {
  const input = document.createElement('input');
  input.type = "file";
  input.accept = accept;

  const promise = new Promise<string>((res, rej) => {
    input.addEventListener("change", () => {
      try {
        const file = input.files![0];
        res(readFile(file));
      } catch (err) {
        rej(err);
      }
    });

    // Input's cancel event is only baseline 2023
    // so there's a chance this promise will stay in memory
    // but it shouldn't be too big a problem.
    input.addEventListener("cancel", () => {
      rej(new Error("File picker cancelled"))
    });
  });

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);

  return promise;
}

export function downloadFile(filename: string, data: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(data)
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}