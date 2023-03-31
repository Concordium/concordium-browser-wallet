// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function saveData(data: any, fileName: string) {
    const domElement = document.createElement('a');
    document.body.appendChild(domElement);
    const blob = new Blob([JSON.stringify(data)], { type: 'application/octet-binary' });
    const url = window.URL.createObjectURL(blob);
    domElement.href = url;
    domElement.download = fileName;
    domElement.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(domElement);
}
