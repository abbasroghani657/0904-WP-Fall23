export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl py-12 prose">
      <h1>Privacy Policy (Demo)</h1>
      <p>This demo collects a single selfie image after your explicit consent for the purpose of educational demonstration. Images are stored locally on the server and visible only to admins in this demo environment.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Email address and password (hashed)</li>
        <li>Consent-based selfie image</li>
      </ul>
      <h2>Retention</h2>
      <p>Selfies are automatically deleted after the configured retention period, adjustable by an administrator.</p>
    </div>
  )
}

