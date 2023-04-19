const { spawn } = require('child_process')

async function runPythonScript(filePath) {
  return new Promise((resolve, reject) => {
    // 実行する Python スクリプトのパスと引数を指定
    const python = spawn('python', ['./running.py', filePath])

    // 標準出力を取得
    python.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    // 標準エラー出力を取得
    python.stderr.on('data', (data) => {
      console.error(data.toString())
    })

    // 実行完了時の処理
    python.on('close', (code) => {
      if (code === 0) {
        console.log('Python script executed successfully.')
        resolve()
      } else {
        console.error(`Python script execution failed with code ${code}.`)
        reject()
      }
    })
  })
}

module.exports = { runPythonScript }

//--q このコードは具体的に何をしているんですか？
//--a このコードは、Pythonスクリプトを実行しています。
//--q 具体的にはどのような操作を行っているんですか？順番に教えてください。
//--a このコードは、以下のような操作を行っています。
//--a 1. Pythonスクリプトを実行する。
//--a 2. 標準出力を取得する。
//--a 3. 標準エラー出力を取得する。
//--a 4. 実行完了時の処理を行う。
//--q python.on('close', (code) => {の中身はどういう意味ですか？
//--a python.on('close', (code) => {の中身は、Pythonスクリプトの実行結果を取得しています。
//--q python.on('close', (code) => {のどこで実行結果はどこで取得されていますか？
//--q この関数はどうやって使うんですか？また戻り値を変数に格納は出出来ますか？
//--a この関数は、以下のように使います。
//--a const filepath = await runPythonScript(filePath);
//--a また、戻り値を変数に格納することが出来ます。
//--q この戻り値のfilepathは、実行するpythonファイルがrunning.pyの時どうなりますか？
//--a この戻り値のfilepathは、実行するpythonファイルがrunning.pyの時、  
//--a 以下のようになります。
//--a Python script executed successfully.
//--a また、この戻り値のfilepathは、実行するpythonファイルがrunning.pyの時、
//--a 以下のようになります。
//--a Python script execution failed with code 1.
//--q つまり、この関数を使うにはどうすればいいですか？また戻り値を変数に格納は出出来ますか？
//--a この関数を使うには、以下のようにします。
//--a const filepath = await runPythonScript(filePath);
//--a また、戻り値を変数に格納することが出来ます。
//--q この時、filepathはどうなりますか？
//--a この時、filepathは、以下のようになります。
//--a Python script executed successfully.
//--q const filepath = await runPythonScript(filePath);のconst filepathは何が格納されていますか？
//--a const filepath = await runPythonScript(filePath);のconst filepathは、 
//--a Python script executed successfully.が格納されています。
//--q つまり、const filepathには文字列が格納されているんですか？
//--a つまり、const filepathには文字列が格納されているんです。

