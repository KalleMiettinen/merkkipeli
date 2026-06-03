using Mscc.GenerativeAI;
using Microsoft.AspNetCore.Http.Features;


var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<FormOptions>(options =>
{
    // 10 GB upload limit for long match videos.
    // Adjust lower if your machine/server has limited disk space.
    options.MultipartBodyLengthLimit = 10L * 1024L * 1024L * 1024L;
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10L * 1024L * 1024L * 1024L;
});

var app = builder.Build();

var uploadRoot = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadRoot);

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/api/videos/upload", async (HttpRequest request) =>
{
    if (!request.HasFormContentType)
    {
        return Results.BadRequest(new { error = "Pyynnön pitää olla multipart/form-data." });
    }

    var form = await request.ReadFormAsync();
    var video = form.Files.GetFile("video");
    var target = form["target"].ToString();
    var basePath = form["basePath"].ToString();
    var prompt = form["prompt"].ToString();

    if (video is null || video.Length == 0)
    {
        return Results.BadRequest(new { error = "Videotiedosto puuttuu." });
    }

    var allowedExtensions = new[] { ".mp4", ".mov", ".mkv", ".avi", ".webm" };
    var extension = Path.GetExtension(video.FileName).ToLowerInvariant();

    if (!allowedExtensions.Contains(extension))
    {
        return Results.BadRequest(new { error = "Tiedostomuoto ei ole sallittu. Käytä esim. MP4, MOV, MKV, AVI tai WEBM." });
    }

    var safeName = $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}{extension}";
    var savePath = Path.Combine(uploadRoot, safeName);

    await using (var stream = File.Create(savePath))
    {
        await video.CopyToAsync(stream);
    }

    var metadata = new
    {
        id = Path.GetFileNameWithoutExtension(safeName),
        originalFileName = video.FileName,
        storedFileName = safeName,
        sizeBytes = video.Length,
        target,
        basePath,
        prompt,
        uploadedAtUtc = DateTime.UtcNow,
        status = "uploaded"
    };

    var metadataPath = Path.Combine(uploadRoot, $"{metadata.id}.json");
    await File.WriteAllTextAsync(
        metadataPath,
        System.Text.Json.JsonSerializer.Serialize(metadata, new System.Text.Json.JsonSerializerOptions
        {
            WriteIndented = true
        })
    );

    return Results.Ok(metadata);
});

app.MapGet("/api/videos", () =>
{
    var files = Directory
        .GetFiles(uploadRoot, "*.json")
        .OrderByDescending(File.GetCreationTimeUtc)
        .Select(path => System.Text.Json.JsonSerializer.Deserialize<object>(File.ReadAllText(path)));

    return Results.Ok(files);
});

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    app = "MerkkiAnalyzer backend",
    timeUtc = DateTime.UtcNow
}));


//tekoäly
app.MapGet("/api/test-ai", async () =>
{
    try
    {
        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY");

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return Results.BadRequest("API key missing.");
        }

        var googleAI = new GoogleAI(apiKey);

        // Gemini malli
        var model = googleAI.GenerativeModel("gemini-2.0-flash");

        var response = await model.GenerateContent("Sano yksi sana.");

        return Results.Ok(response.Text);
    }
    catch (Exception ex)
    {
        return Results.BadRequest("AI test failed: " + ex.Message);
    }
});

app.Run();