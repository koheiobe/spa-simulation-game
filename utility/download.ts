// import JSZip from 'jszip'

type FileInfo = {
  type: string
  ext: string
}

const FILE_TYPES: { [s: string]: FileInfo } = {
  html: {
    type: 'text/html',
    ext: 'html'
  },
  css: {
    type: 'text/css',
    ext: 'css'
  },
  json: {
    type: 'application/json',
    ext: 'json'
  },
  png: {
    type: 'image/png',
    ext: 'png'
  }
}

/**
 * 指定したテキストをファイルとしてダウンロード
 *
 * @param {string} text 対象となるデータ
 * @param {string} type 保存ファイルの形式、 `html` をサポート
 * @param {string} fileName ファイル名
 * @return {boolean} DL 処理出来たか
 */
export const downloadFile = (text: string, type: string, fileName: string) => {
  if (text.length === 0) return false
  if (type.length === 0) return false
  // 非対応の形式の場合は失敗とする
  if (!(type in FILE_TYPES)) return false

  // ダウンロード処理
  const blob = new Blob([text], { type: FILE_TYPES[type].type })
  const tempLink = document.createElement('a')
  tempLink.href = window.URL.createObjectURL(blob)
  tempLink.target = '_blank'
  tempLink.setAttribute('download', `${fileName}.${FILE_TYPES[type].ext}`)
  tempLink.click()
  return true
}

// JSZipをインストールする必要あり
// /**
//  * 指定したテキストをファイル化し、zipにまとめてダウンロード
//  *
//  * @param {string} text 対象となるデータ
//  * @param {string} type 保存ファイルの形式、 `html` をサポート
//  * @param {string} fileName ファイル名
//  * @return {boolean} DL 処理出来たか
//  */
// export const downloadZip = async (
//   text: string,
//   type: string,
//   fileName: string
// ) => {
//   if (text.length === 0) return false
//   if (type.length === 0) return false
//   // 非対応の形式の場合は失敗とする
//   if (!(type in FILE_TYPES)) return false

//   // Zip化
//   const zip = new JSZip()
//   zip.file(`${fileName}.${FILE_TYPES[type].ext}`, text)
//   const zipFile = await zip.generateAsync<'blob'>({
//     type: 'blob',
//     compression: 'DEFLATE',
//     compressionOptions: { level: 9 }
//   })

//   // ダウンロード処理
//   const tempLink = document.createElement('a')
//   tempLink.href = window.URL.createObjectURL(zipFile)
//   tempLink.target = '_blank'
//   tempLink.setAttribute('download', `${fileName}.zip`)
//   tempLink.click()
//   return true
// }
