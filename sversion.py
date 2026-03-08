from os import path
import json

base_path = path.dirname(__file__)
packege_version = path.join(base_path, 'package.json')
tauri_version = path.join(base_path, 'src-tauri/tauri.conf.json')

with open(packege_version, 'r', encoding='utf-8') as f:
    pkg = json.load(f)

with open(tauri_version, 'r', encoding='utf-8') as f:
    tauri = json.load(f)

newVersion = pkg['version']


if newVersion != tauri['version']:
    tauri['version'] = newVersion
    try:
        with open(tauri_version, 'w') as outfile:
            json.dump(tauri, outfile, indent=2, ensure_ascii=False)
            outfile.write('\n')
    except Exception as e:
        print(e)
    
    print("Versão do Tauri sincronizada para: ", newVersion)
else:
    print("Versão do Tauri já está sincronizada")


