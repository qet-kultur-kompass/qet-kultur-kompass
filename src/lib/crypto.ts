import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Verschlüsselt SAP-Zugangsdaten (Client Secrets etc.) ruhend in der Datenbank
// mit AES-256-GCM. Der Schlüssel wird aus SAP_CREDENTIALS_KEY (Pflicht-Env in
// Produktion, sobald sapEnabled genutzt wird) abgeleitet. OHNE diesen Wert
// werden SAP-Zugangsdaten NICHT gespeichert (siehe requireEncryptionKey).

function requireEncryptionKey(): Buffer {
  const secret = process.env.SAP_CREDENTIALS_KEY;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SAP_CREDENTIALS_KEY fehlt oder ist zu kurz (mind. 16 Zeichen) – bitte in .env setzen, " +
        "bevor SAP-Zugangsdaten gespeichert werden."
    );
  }
  return scryptSync(secret, "qet-sap-integration", 32);
}

export function encryptSecret(plain: string): string {
  const key = requireEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext, jeweils base64
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptSecret(stored: string): string {
  const key = requireEncryptionKey();
  const [ivB64, tagB64, dataB64] = stored.split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Ungültiges verschlüsseltes Secret-Format.");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
