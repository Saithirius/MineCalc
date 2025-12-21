import archiver from 'archiver';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Форматирование даты
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}h${minutes}m${seconds}s`;
}

// Проверяем папку на существование
async function folderExists(folderPath) {
  try {
    await fsp.access(folderPath);
    return true; // Папка существует
  } catch {
    return false; // Папка не существует
  }
}

// Копируем файлы из папки в другую папку, исключая файлы, соответствующие шаблону
async function copyFilesExcept(sourceDir, targetDir, excludePattern) {
  try {
    // Создаем целевую директорию, если она не существует
    await fsp.mkdir(targetDir, { recursive: true });

    // Читаем содержимое исходной директории
    const items = await fsp.readdir(sourceDir, { withFileTypes: true });

    // Создаем регулярное выражение для исключения файлов
    const regex = new RegExp(excludePattern);

    for (const item of items) {
      const sourcePath = path.join(sourceDir, item.name);
      const targetPath = path.join(targetDir, item.name);

      if (item.isDirectory()) {
        // Если это директория, рекурсивно копируем её содержимое
        await copyFilesExcept(sourcePath, targetPath, excludePattern);
      } else if (item.isFile() && !regex.test(item.name)) {
        // Если это файл и он не соответствует исключающему шаблону, копируем его
        await fsp.copyFile(sourcePath, targetPath);
        console.log(`Скопирован файл: ${item.name}`);
      }
    }
  } catch (err) {
    console.error('Ошибка при копировании файлов:', err);
  }
}

// Создаем архив с папкой внутри
async function archiveFolder(sourceFolder, outputArchive) {
  const output = fs.createWriteStream(outputArchive);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Уровень сжатия (максимальный)
  });

  output.on('close', () => {
    console.log(`Архив создан: ${outputArchive} (${archive.pointer()} байт)`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  const folderName = path.basename(sourceFolder); // Имя папки в архиве
  archive.directory(sourceFolder, folderName);

  await archive.finalize();
}

async function main() {
  // Дата
  const date = formatDate(new Date());

  // Версия проекта
  const packageJSONBuffer = await fsp.readFile('package.json', { encoding: 'utf-8' });
  const packageJSON = JSON.parse(packageJSONBuffer);
  const versionMatch = packageJSON.version;

  const releaseName = `keys_${versionMatch}_${date}`;

  // Пути
  const __filename = fileURLToPath(import.meta.url);
  const __root = path.join(__filename, '..');
  const __build = path.join(__root, 'build');
  const __dist = path.join(__root, 'dist');
  const isDistExists = await folderExists(__dist);
  if (!isDistExists) await fsp.mkdir('dist');
  const __release = path.join(__dist, releaseName);

  try {
    // Копирование файлов билда в папку для релиза
    // await fsp.cp(__build, __release, { recursive: true });
    await copyFilesExcept(__build, __release, '^config\\.js$');
    // Создание архива с папкой релиза
    await archiveFolder(__release, `${__release}.zip`);
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

main();
