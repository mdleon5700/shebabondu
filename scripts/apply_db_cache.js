const fs = require('fs');
const file = 'src/lib/db.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('let _cachedDbState')) {
  content = content.replace(
    'function loadDB(): DatabaseState {',
    'let _cachedDbState: DatabaseState | null = null;\nlet _cachedDbMtime: number = 0;\n\nfunction loadDB(): DatabaseState {'
  );

  content = content.replace(
    'const raw = fs.readFileSync(DB_FILE, \'utf8\');',
    'const currentMtime = fs.statSync(DB_FILE).mtimeMs;\n    if (_cachedDbState && _cachedDbMtime === currentMtime) {\n      return _cachedDbState;\n    }\n\n    const raw = fs.readFileSync(DB_FILE, \'utf8\');'
  );

  content = content.replace(
    'return state;\n\n  } catch (loadErr) {',
    '_cachedDbState = state;\n    _cachedDbMtime = currentMtime;\n    return state;\n\n  } catch (loadErr) {'
  );

  content = content.replace(
    'return state;\r\n\r\n  } catch (loadErr) {',
    '_cachedDbState = state;\r\n    _cachedDbMtime = currentMtime;\r\n    return state;\r\n\r\n  } catch (loadErr) {'
  );

  content = content.replace(
    '// 3. Atomic rename to replace active store file with Windows fallback',
    '_cachedDbState = state;\n    if (fs.existsSync(DB_FILE)) { _cachedDbMtime = fs.statSync(DB_FILE).mtimeMs; }\n    // 3. Atomic rename to replace active store file with Windows fallback'
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated src/lib/db.ts with smart mtime caching');
} else {
  console.log('Cache already present');
}