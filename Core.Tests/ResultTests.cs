using System.Text.Json;
using KolibSoft.Catalogue.Core;

namespace Core.Tests;

public class ResultTests
{
    [SetUp]
    public void Setup()
    {
    }

    [Test]
    public void Conversions()
    {
        Result<decimal?> result = default;
        result = 123m;
        Assert.IsTrue(result.Ok);
        Assert.IsTrue(result.Errors.Length == 0);
        Assert.IsTrue(result == 123m);

        result = new string[] { "ERROR", "ERROR" };
        Assert.IsFalse(result.Ok);
        Assert.IsTrue(result.Data == null);
        Assert.IsTrue(result.Errors.SequenceEqual(new string[] { "ERROR", "ERROR" }));
    }

    [Test]
    public void Serialization()
    {
        Result<decimal?> result = default;
        result = 123m;
        var json = JsonSerializer.Serialize(result);
        var parsed = JsonSerializer.Deserialize<Result<decimal?>>(json);
        Assert.AreEqual(result.Data, parsed.Data);
        Assert.AreEqual(result.Errors, parsed.Errors);

        result = new string[] { "ERROR", "ERROR" };
        json = JsonSerializer.Serialize(result);
        parsed = JsonSerializer.Deserialize<Result<decimal?>>(json);
        Assert.AreEqual(result.Data, parsed.Data);
        Assert.AreEqual(result.Errors, parsed.Errors);
    }

}