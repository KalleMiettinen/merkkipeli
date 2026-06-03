# MerkkiAnalyzer Backend

Yksityinen pesäpallon videoanalyysityökalu.

Tämä versio sisältää ensimmäisen backendin:

- ASP.NET Core .NET 8
- videotiedoston lataus
- videon tallennus `uploads`-kansioon
- metatietojen tallennus JSON-tiedostoksi
- valmis frontend `wwwroot`-kansiossa

## Käynnistys

Varmista, että .NET 8 SDK on asennettu.

Aja projektikansiossa:

```powershell
dotnet run
```

Avaa selaimessa osoite, jonka terminaali näyttää, esimerkiksi:

```text
http://localhost:5000
```

tai

```text
https://localhost:7000
```

## API

### Health check

```http
GET /api/health
```

### Lataa video

```http
POST /api/videos/upload
```

FormData-kentät:

- `video`
- `target`
- `basePath`
- `prompt`

### Listaa ladatut videot

```http
GET /api/videos
```

## Upload-kansio

Kun lataat videon, backend luo projektin juureen kansion:

```text
uploads
```

Sinne tallentuu:

- videotiedosto
- JSON-metatiedosto


