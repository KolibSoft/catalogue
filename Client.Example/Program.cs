using System.Text.Json;
using KolibSoft.Catalogue.Client.Example;
using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Catalogues;

var httpClient = new HttpClient();
var uri = "https://localhost:7072";
// var uri = "http://localhost:5033";
var start = DateTime.UtcNow;

var json = File.Exists("changes.json") ? await File.ReadAllTextAsync("changes.json") : "[]";
var changes = JsonSerializer.Deserialize<IList<Change>>(json)!;

var connector = new ServiceCatalogue<SettingsModel, object>(
    new DatabaseCatalogue<SettingsModel, object>(new SettingsContext()),
    new SettingsService(httpClient, $"{uri}/settings"),
    changes
);

await connector.SyncChangesAsync();
await InsertMany();

var page = await connector.QueryAsync();
var item = await connector.GetAsync(page.Data!.Items.First().Id);

json = JsonSerializer.Serialize(connector.Changes);
await File.WriteAllTextAsync("changes.json", json);

async Task InsertMany()
{
    for (var i = 0; i < 5; i++)
    {
        var idResult = await connector!.InsertAsync(new SettingsModel { Value = $"SYNC" });
    }
}