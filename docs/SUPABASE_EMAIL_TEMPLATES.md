# Templates email Supabase Auth

Ces templates remplacent ceux par défaut de Supabase (anglais, génériques).
À configurer dans **Supabase Dashboard → Authentication → Email Templates**.

Pour chaque template, copie-colle le HTML correspondant + adapte le **Subject**.

⚠️ Les variables Supabase (`{{ .ConfirmationURL }}`, `{{ .Token }}`, etc.)
doivent rester **exactement comme ça**. Ne les traduis pas, ne les modifie pas.

---

## 1. Confirm signup

**Subject** :
```
Confirme ton inscription sur NextMove AI ✨
```

**HTML body** :
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);width:40px;height:40px;border-radius:10px;line-height:40px;color:#fff;font-weight:bold;font-size:18px">N</div>
      <p style="margin:8px 0 0;color:#4be277;font-weight:800;font-size:20px;letter-spacing:-0.5px">NextMove AI</p>
    </div>
    <div style="background:#141414;border:1px solid #222;border-radius:16px;padding:32px;color:#e0e0e0;font-size:14px;line-height:1.7">
      <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Bienvenue 👋</h1>
      <p>Merci de t'être inscrit sur <strong style="color:#4be277">NextMove AI</strong>. Plus qu'une étape pour démarrer ton diagnostic personnalisé&nbsp;: confirme ton adresse email.</p>
      <div style="text-align:center;margin:28px 0">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Confirmer mon email →
        </a>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px">Si tu n'es pas à l'origine de cette inscription, tu peux ignorer cet email — aucune action ne sera prise sur ton adresse.</p>
      <p style="color:#888;font-size:12px;margin-top:16px">Le lien ci-dessus reste valide pendant 24 heures.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
      © 2026 NextMove AI · <a href="https://nextmove.sh" style="color:#4be277;text-decoration:none">nextmove.sh</a>
    </p>
  </div>
</body>
</html>
```

---

## 2. Reset password

**Subject** :
```
Réinitialise ton mot de passe NextMove
```

**HTML body** :
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);width:40px;height:40px;border-radius:10px;line-height:40px;color:#fff;font-weight:bold;font-size:18px">N</div>
      <p style="margin:8px 0 0;color:#4be277;font-weight:800;font-size:20px;letter-spacing:-0.5px">NextMove AI</p>
    </div>
    <div style="background:#141414;border:1px solid #222;border-radius:16px;padding:32px;color:#e0e0e0;font-size:14px;line-height:1.7">
      <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Réinitialisation du mot de passe</h1>
      <p>Tu as demandé à réinitialiser ton mot de passe NextMove AI. Clique sur le bouton ci-dessous pour en choisir un nouveau&nbsp;:</p>
      <div style="text-align:center;margin:28px 0">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Choisir un nouveau mot de passe →
        </a>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px"><strong style="color:#e0e0e0">Tu n'as pas fait cette demande&nbsp;?</strong> Tu peux ignorer cet email en toute sécurité, ton mot de passe actuel reste valide.</p>
      <p style="color:#888;font-size:12px;margin-top:16px">Ce lien expire dans 1 heure.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
      © 2026 NextMove AI · <a href="https://nextmove.sh" style="color:#4be277;text-decoration:none">nextmove.sh</a>
    </p>
  </div>
</body>
</html>
```

---

## 3. Magic Link

**Subject** :
```
Ton lien de connexion NextMove 🔑
```

**HTML body** :
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);width:40px;height:40px;border-radius:10px;line-height:40px;color:#fff;font-weight:bold;font-size:18px">N</div>
      <p style="margin:8px 0 0;color:#4be277;font-weight:800;font-size:20px;letter-spacing:-0.5px">NextMove AI</p>
    </div>
    <div style="background:#141414;border:1px solid #222;border-radius:16px;padding:32px;color:#e0e0e0;font-size:14px;line-height:1.7">
      <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Connexion sans mot de passe</h1>
      <p>Voici ton lien de connexion pour accéder à ton compte NextMove AI&nbsp;:</p>
      <div style="text-align:center;margin:28px 0">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Me connecter →
        </a>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px">Ce lien est unique, personnel et reste valide pendant 1 heure. Si tu n'as pas demandé à te connecter, ignore simplement cet email.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
      © 2026 NextMove AI · <a href="https://nextmove.sh" style="color:#4be277;text-decoration:none">nextmove.sh</a>
    </p>
  </div>
</body>
</html>
```

---

## 4. Change Email Address

**Subject** :
```
Confirme ton nouvel email NextMove
```

**HTML body** :
```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);width:40px;height:40px;border-radius:10px;line-height:40px;color:#fff;font-weight:bold;font-size:18px">N</div>
      <p style="margin:8px 0 0;color:#4be277;font-weight:800;font-size:20px;letter-spacing:-0.5px">NextMove AI</p>
    </div>
    <div style="background:#141414;border:1px solid #222;border-radius:16px;padding:32px;color:#e0e0e0;font-size:14px;line-height:1.7">
      <h1 style="color:#fff;font-size:22px;margin:0 0 16px">Confirme ton nouvel email</h1>
      <p>Tu as demandé à modifier l'adresse email associée à ton compte NextMove. Pour valider ce changement, clique sur le bouton ci-dessous&nbsp;:</p>
      <div style="text-align:center;margin:28px 0">
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:linear-gradient(135deg,#4be277,#36d068);color:#000;font-weight:bold;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">
          Confirmer le nouvel email →
        </a>
      </div>
      <p style="color:#888;font-size:12px;margin-top:24px"><strong style="color:#e0e0e0">Tu n'as pas demandé ce changement&nbsp;?</strong> Contacte-nous immédiatement à <a href="mailto:contact@nextmove.sh" style="color:#4be277">contact@nextmove.sh</a> — ton compte est peut-être compromis.</p>
    </div>
    <p style="text-align:center;color:#666;font-size:11px;margin-top:24px">
      © 2026 NextMove AI · <a href="https://nextmove.sh" style="color:#4be277;text-decoration:none">nextmove.sh</a>
    </p>
  </div>
</body>
</html>
```

---

## Procédure pour les coller dans Supabase

1. Va sur **Supabase Dashboard → Authentication → Email Templates**
2. Pour chaque template (Confirm signup, Reset password, etc.) :
   - Onglet **Subject** : remplace par le subject FR ci-dessus
   - Onglet **Body** (HTML) : efface tout, colle le HTML ci-dessus
   - Clique **Save**
3. **Test** : déclenche un signup test avec `+test@gmail.com`, vérifie que l'email reçu est en français avec ton branding.

⚠️ Les variables Supabase (`{{ .ConfirmationURL }}`) sont automatiquement remplacées au moment de l'envoi. Garde-les telles quelles.
