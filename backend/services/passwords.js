const crypto=require('crypto');
function hashPassword(password){if(typeof password!=='string'||password.length<12)throw new Error('password must be at least 12 characters');const salt=crypto.randomBytes(16);const hash=crypto.scryptSync(password,salt,64);return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;}
function verifyPassword(password,encoded){try{const[scheme,saltHex,hashHex]=String(encoded).split('$');if(scheme!=='scrypt')return false;const actual=crypto.scryptSync(password,Buffer.from(saltHex,'hex'),64);const expected=Buffer.from(hashHex,'hex');return actual.length===expected.length&&crypto.timingSafeEqual(actual,expected);}catch{return false;}}
module.exports={hashPassword,verifyPassword};
