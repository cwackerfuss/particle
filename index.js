// glossary
// fileEncryptionKey: the encryption key that decrypts the file contents
// appPublicKey: fileEncryptionKey that's encrypted with an appAccessKey
// appAccessKey: a hash deterministically created on the other app based on the user's appPrivateKey and the other app's url
// localPublicKey: fileEncryptionKey that's encrypted with the local appPrivateKey

function async create(path, contents) {
  const filePath = `${path}/${path}`;
  const fileEncryptionKey = encryption.generateRandomKey();
  const encryptedContents = encryption.encryptWith(fileEncryptionKey, contents);
  const localPublicKey = {
    path: `${path}/public_keys/app_local.txt`,
    contents: encryption.encryptWith(userPrivateKey, fileEncryptionKey)
  }
  await blockstack.putFile(filePath, encryptedContents)
  await blockstack.putFile(localPublicKey.path, localPublicKey.contents)
}

function async getFileEncryptionKey(path, userPrivateKey) {
  const localPublicKey = await blockstack.getFile(`${path}/public_keys/app_local.txt`)
  const decrypted = encryption.decrypt(localPublicKey, userPrivateKey);
  return decrypted;
}

function computePathToPublicKey(filename, appUrl) {
  return `${filename}/public_keys/${appUrl}.txt`
}

function async _getAppFilePermissions(appUrl) {
  const response = await blockstack.getFile(`file_permissions/${appUrl}.json`)
  return JSON.parse(response)
}

function async addNewAppFilePermission(appUrl, filename) {
  const appFilePermissions = await _getAppFilePermissions(appUrl)
  const updatedAppFilePermissions = { items: [ ...appFilePermissions, filename ] }

  return await blockstack.putFile(`file_permissions/${appUrl}.json`, JSON.stringify(updatedAppFilePermissions));
}

function async addAppPublicKey(filename, appAccessKey, appUrl) {
  const fileEncryptionKey = getFileEncryptionKey(filename, userPrivateKey);
  const appPublicKey = {
    path: computePathToPublicKey(filename, appUrl),
    contents: encryption.encryptWith(appAccessKey, fileEncryptionKey)
  }
  await addNewAppFilePermission(appUrl, filename)
  await blockstack.putFile(appPublicKey.path, appPublicKey.contents)
}

// function async fetchAppEncryptionKey(path, appUrl) {
//   const publicKeyPath = computePathToPublicKey(path, appUrl);
//   return blockstack.getFile(publicKeyPath)
// }

// const fileContents = JSON.stringify({});
//
// create('data.json', fileContents)

// a way to discover which files are
