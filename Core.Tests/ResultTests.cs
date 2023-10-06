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
}