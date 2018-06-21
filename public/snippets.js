async function initDevices() {
    window.doctorDevice = new Device();
    window.patientDevice = new Device();
    doctorDevice.configure('doctor');
    patientDevice.configure('patient');
}

async function createDoctorAndPatientCards() {
    const [doctorCardAndKeyPair, patientCardAndKeyPair] = await Promise.all([
        doctorDevice.createCard(),
        patientDevice.createCard()
    ]);

    const doctorPrivateKey = virgilCrypto
        .exportPrivateKey(doctorCardAndKeyPair.keyPair.privateKey)
        .toString("base64");

    const patientPrivateKey = virgilCrypto
        .exportPrivateKey(patientCardAndKeyPair.keyPair.privateKey)
        .toString("base64");

    showOutput(
        "#step-1-output",
        `Doctor card.id: ${doctorCardAndKeyPair.card.id}\n` +
        `Doctor privateKey: ${doctorPrivateKey}\n\n` +
        `Patient card.id: ${patientCardAndKeyPair.card.id}\n` +
        `Patient privateKey: ${patientPrivateKey}\n`
    );

    console.log(doctorCardAndKeyPair, patientCardAndKeyPair);
}

async function loadKey() {
    const privateKey = await doctorDevice.loadKey();

    showOutput(
        "#step-2-output",
        `Doctor privateKey: ${privateKey.toString("base64")}`
    );
}

async function encryptAndDecrypt() {
    const encrypted = await doctorDevice.encrypt(String);

    showOutput(
        "#step-2-1-output",
        `encrypted message: ${encrypted}`
    );

    const decrypted = await patientDevice.decrypt(encrypted);

    showOutput(
        "#step-2-2-output",
        `decrypted message: ${decrypted}`
    );
}

async function signAndVerify() {
    const encrypted = await doctorDevice.signThenEncrypt(String);

    showOutput(
        "#step-3-1-output",
        `encrypted message: ${encrypted}`
    );

    const decrypted = await patientDevice.decryptThenVerify(encrypted, String);

    showOutput(
        "#step-3-2-output",
        `decrypted message: ${decrypted.toString('utf-8')}`
    );
}
