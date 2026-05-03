import {translate} from 'google-translate-api-x';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definicion del tipo de diccionario para asegurar la estructura 
type Dictionary = Record<string, string>

// Rutas absolutas para evitar problemas al ejecutar el script desde distintas carpetas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localsDir = path.resolve(__dirname, '../locals');
const esFile = path.join(localsDir, 'es.json');
const enFile = path.join(localsDir, 'en.json');

// Funcion para traducir un diccionario completo usando google-translate-api-x
async function autoTranslate(): Promise<void> {
    console.log("Iniciando sincronizacion de traducciones (ES->EN)...");

    // 1. Leer el diccionario origen (Español)
    // El condicion verifica si existe el archivo
    if (!fs.existsSync(esFile)){
        console.error(`File not found: ${esFile}`);
        process.exit(1);
    }
    // Si el archivo existe, se lee y se parsea el contenido JSON
    const esTranslations: Dictionary = JSON.parse(fs.readFileSync(esFile, 'utf-8'));

    // 2. Leer el diccionario destino (Ingles) si existe, o inicializarlo vaio 
    let enTranslations: Dictionary = {};
    if(fs.existsSync(enFile)){
        enTranslations = JSON.parse(fs.readFileSync(enFile, 'utf-8'));
    }

    let translatedCount = 0;

    // 3. Iterar y traducir solo lo que falta (Incremental)
    for (const [key, value] of Object.entries(esTranslations)) {
        // Si la llave ya existe en el archivo destino, se ignora
        if (enTranslations[key]){
            continue;
        }

        try {
            const res = await translate(value, { from: 'es', to: 'en'});
            enTranslations[key] = res.text;
            console.log(`Translated text for key "${key}": "${value}" -> "${res.text}"`);
            translatedCount++;

            // Para evitar saturar el servicio, se puede agregar un pequeño delay entre traducciones
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        }catch(error) {
            console.error(`Error translating key "${key}":`, error);
            enTranslations[key] = value; // Fallback: usar el texto original si falla la traduccion
        }
    }
    console.log(`Total translations completed: ${translatedCount}`);

    // 4. Guardar resultados solo si hubo cambios
    if (translatedCount > 0){
        // Creamos la carpeta si no existe 
        if(!fs.existsSync(localsDir)){
            fs.mkdirSync(localsDir, { recursive: true });
        }
        fs.writeFileSync(enFile, JSON.stringify(enTranslations, null, 2), 'utf-8');
        console.log(`Se completo la sincronizacion. Se añadieron ${translatedCount} nuevas traducciones al archivo ${enFile}`);
    }else{
        console.log(`No se han encontrado nuevas palabras en el diccionario. Dicionario sincronizados !!!`);
    }
}

autoTranslate();