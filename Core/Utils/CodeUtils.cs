namespace KolibSoft.Catalogue.Core.Utils;

public static class CodeUtils
{

    public static string ToCode(this string? @string)
    {
        var code = @string?.Trim().ToUpper().Replace(" ", "_") ?? CatalogueStatics.NoCode;
        return code;
    }

}