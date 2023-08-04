using System.Net.Http.Json;

namespace KolibSoft.Catalogue.Core.Utils;

public static class ResultUtils
{

    public static async Task<Result<T?>> HandleResult<T>(this HttpResponseMessage response)
    {
        try
        {
            var result = await response.Content.ReadFromJsonAsync<Result<T?>>();
            if (result != null) return result;
        }
        catch { }
        return new string[] { response.ReasonPhrase.ToCode() };
    }

}