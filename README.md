# AI Desktop Frontend 

Frontend для нейросети (Electron + React + TypeScript).

---

## 📦 Что должно быть установлено

- **Node.js** (LTS) — https://nodejs.org
- **Git** — https://git-scm.com
- **VS Code** — https://code.visualstudio.com

Рекомендуемые расширения в VS Code:
- ESLint
- Prettier
- Tailwind CSS IntelliSense

---

## Как запустить

```bash
# 1. Клонировать репозиторий
git clone https://github.com/Asthma86/aiproject.git
cd aiproject

# 2. Установить зависимости
npm install

# 3. Запустить
npm run dev          # в браузере (http://localhost:5173)
npm run electron:dev # в Electron (.exe)

# 4. Разработка
# Создать ветку под задачу
git checkout -b feature/твоя-задача
# Внести изменения → закоммитить → запушить
git add .
git commit -m "описание изменений"
git push origin feature/твоя-задача

# 5. Если что-то не работает
# Очистить кеш и переустановить
Remove-Item -Path ".\node_modules" -Recurse -Force
Remove-Item -Path ".\package-lock.json" -Force
npm install
# Перезапустить с очисткой кеша
npm run dev -- --force