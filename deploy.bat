@echo off
echo Iniciando o Deploy para o Vercel...
echo Por favor, faca login no browser se lhe for pedido!
npx vercel --prod -y -e NEXT_PUBLIC_SUPABASE_URL="https://qqhlsdmnylycjglenqpe.supabase.co" -e NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_lBW89yKmmfzH2VgznPMcjw_uQePKP5A"
echo.
echo Deploy concluido! Verifique o link acima.
pause
