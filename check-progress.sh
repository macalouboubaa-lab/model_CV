#!/bin/bash

echo "═══════════════════════════════════════"
echo "📋 VÉRIFICATION DE PROGRESSION — SAMA CV"
echo "═══════════════════════════════════════"

echo ""
echo "🔧 Fichiers de référence :"
for f in PROJECT_RULES.md ARCHITECTURE.md CHANGELOG.md TASKS.md ATS_GUIDELINES.md README.md; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ $f MANQUANT"
done

echo ""
echo "🎨 Assets :"
for f in assets/auth.js assets/protection.js assets/logo-sama-cv.svg favicon.svg favicon.png; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ $f MANQUANT"
done

echo ""
echo "📄 Pages principales :"
for f in index.html login.html signup.html payment.html admin.html payment-success.html guide.html; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ $f MANQUANT"
done

echo ""
echo "📑 Modèles de CV :"
COUNT=$(ls model*.html 2>/dev/null | wc -l)
echo "  📊 $COUNT / 24 modèles trouvés"
if [ "$COUNT" -lt 24 ]; then
  echo "  ❌ Modèles manquants :"
  for i in $(seq 1 24); do
    [ -f "model$i.html" ] || echo "     - model$i.html"
  done
fi

echo ""
echo "🌐 Config :"
for f in package.json vercel.json .gitignore .env.example; do
  [ -f "$f" ] && echo "  ✅ $f" || echo "  ❌ $f MANQUANT"
done

echo ""
echo "═══════════════════════════════════════"
