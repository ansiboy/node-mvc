const { startServer } = require('../dist/index');
startServer({
    port: 1234,
    root_path: __dirname,
    /** 控制器的文件夹，默认为根目录下的 modules
     controller_directories = []
     */
});

// http.request({
//     path: ''
// })
// function formatString(str, args) {
//     return str.replace(/\$(\d+)/g, function (match, number) {
//         console.log(match)
//         return typeof args[number] != 'undefined' ? args[number] : match;
//     });
// };
// console.log(formatString('AA $0', [1]))
// let regex = new RegExp(`http\:\/\/www.163.com\/(\S+)`)
// let target = 'http://localhost:2635/$1'
// let arr = regex.exec("http://www.163.com/admin")
// if (arr) {
//     target = target.replace(/\$(\d+)/, (match, number) => {
//         return typeof arr[number] != 'undefined' ? arr[number] : match;
//     })
// }
// console.log(arr)
// console.log(target)
//# sourceMappingURL=index.js.map