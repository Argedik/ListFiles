// Otomatik oluşturulmuş dosya listeleme scripti
function listFiles(dirPath, excludeList, fileList = []) {
    const files = fs__WEBPACK_IMPORTED_MODULE_0___default().readdirSync(dirPath);
    files.forEach((file)=>{
        const fullPath = path__WEBPACK_IMPORTED_MODULE_1___default().join(dirPath, file);
        const stat = fs__WEBPACK_IMPORTED_MODULE_0___default().statSync(fullPath);
        const isExcluded = excludeList.some((excludePath)=>fullPath.includes(excludePath));
        if (stat.isDirectory()) {
            if (!isExcluded) {
                listFiles(fullPath, excludeList, fileList);
            }
        } else {
            if (!isExcluded) {
                fileList.push(fullPath);
            }
        }
    });
    return fileList;
}

const files = listFiles('C:\Users\enes.gedik\Desktop\fe\listfiles', [".git","target","Cargo.lock","Cargo.toml","migrations",".rs","node_modules",".js",".jsx","package.json","package-lock.json"]);
console.log(files.join('\n'));
