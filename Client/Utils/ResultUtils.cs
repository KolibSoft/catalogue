using System.Net.Http.Json;
using KolibSoft.Catalogue.Core;
using KolibSoft.Catalogue.Core.Utils;

namespace KolibSoft.Catalogue.Client.Utils;

public static class ResultUtils
{

    public static async Task<Result<T?>> HandleResult<T>(this HttpResponseMessage response)
    {
        try
        {
            var result = await response.Content.ReadFromJsonAsync<Result<T?>?>();
            if (result != null) return result.Value;
        }
        catch (Exception e) { Console.WriteLine(e.Message); }
        return new string[] { response.ReasonPhrase.ToCode() };
    }

}