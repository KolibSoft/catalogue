namespace KolibSoft.Catalogue.Core;

public class Change
{

    public Guid Id { get; init; } = default;
    public string[] Errors { get; set; } = Array.Empty<string>();


    public Change(Guid id, params string[] errors)
    {
        Id = id;
        Errors = errors;
    }

}