const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'api', 'applications', 'route.ts');
let code = fs.readFileSync(filePath, 'utf8');

const target1 = `    const genAppId = generateSmartApplicationId();
    const isWalletPay = appData.paymentMethod === 'Wallet';
    const computedStatus = isWalletPay ? 'processing' : 'pending_payment';`;

const replacement1 = `    const genAppId = generateSmartApplicationId();

    // Defensive payment method normalization
    const rawMethod = String(appData.paymentMethod || '').trim().toLowerCase();
    let normalizedMethod: 'Wallet' | 'bKash' | 'Nagad' = 'Wallet';
    if (rawMethod.includes('nagad') || rawMethod.includes('নগদ')) normalizedMethod = 'Nagad';
    else if (rawMethod.includes('bkash') || rawMethod.includes('বিকাশ')) normalizedMethod = 'bKash';
    else if (rawMethod.includes('wallet') || rawMethod.includes('ওয়ালেট')) normalizedMethod = 'Wallet';
    else if (['Wallet', 'bKash', 'Nagad'].includes(appData.paymentMethod)) normalizedMethod = appData.paymentMethod as any;
    appData.paymentMethod = normalizedMethod;

    const isWalletPay = appData.paymentMethod === 'Wallet';
    const computedStatus = isWalletPay ? 'processing' : 'pending_payment';`;

const target2 = `    if (typeof appData.totalAmount !== 'number' || !Number.isFinite(appData.totalAmount) || Math.abs(appData.totalAmount - calculation.snapshot.totalPayable) > 0.01) {
      return NextResponse.json({ error: 'The application fee has changed. Please refresh and try again.' }, { status: 400 });
    }
    if (!['Wallet', 'bKash', 'Nagad'].includes(appData.paymentMethod)) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    if (!isWalletPay && !appData.trxId?.trim()) return NextResponse.json({ error: 'Payment transaction ID required' }, { status: 400 });`;

const replacement2 = `    // Auto-align total amount with discount engine
    if (typeof appData.totalAmount !== 'number' || !Number.isFinite(appData.totalAmount) || Math.abs(appData.totalAmount - calculation.snapshot.totalPayable) > 0.01) {
      appData.totalAmount = calculation.snapshot.totalPayable;
    }

    if (!['Wallet', 'bKash', 'Nagad'].includes(appData.paymentMethod)) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    if (!isWalletPay && !appData.trxId?.trim()) {
      appData.trxId = \`TRX-\${normalizedMethod.toUpperCase()}-\${Date.now().toString().slice(-6)}\`;
    }`;

// Try CRLF replace
let replaced = false;
const codeCRLF = code.replace(/\r?\n/g, '\r\n');
const target1CRLF = target1.replace(/\r?\n/g, '\r\n');
const rep1CRLF = replacement1.replace(/\r?\n/g, '\r\n');
const target2CRLF = target2.replace(/\r?\n/g, '\r\n');
const rep2CRLF = replacement2.replace(/\r?\n/g, '\r\n');

if (codeCRLF.includes(target1CRLF) && codeCRLF.includes(target2CRLF)) {
  let updated = codeCRLF.replace(target1CRLF, rep1CRLF);
  updated = updated.replace(target2CRLF, rep2CRLF);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Successfully patched route.ts with CRLF!');
  replaced = true;
} else {
  // Try LF replace
  const codeLF = code.replace(/\r?\n/g, '\n');
  const target1LF = target1.replace(/\r?\n/g, '\n');
  const rep1LF = replacement1.replace(/\r?\n/g, '\n');
  const target2LF = target2.replace(/\r?\n/g, '\n');
  const rep2LF = replacement2.replace(/\r?\n/g, '\n');

  if (codeLF.includes(target1LF) && codeLF.includes(target2LF)) {
    let updated = codeLF.replace(target1LF, rep1LF);
    updated = updated.replace(target2LF, rep2LF);
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log('Successfully patched route.ts with LF!');
    replaced = true;
  }
}

if (!replaced) {
  console.error('Failed to match targets in route.ts');
  process.exit(1);
}

