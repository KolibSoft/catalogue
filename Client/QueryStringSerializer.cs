using System;
using System.Collections;
using System.Text.Json;
using System.Web;

namespace KolibSoft.Catalogue.Client;

public static class QueryStringSerializer
{

    private static List<QueryStringConverter> Converters { get; } = new List<QueryStringConverter>
    {
        new() {
            Match = (type) => type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>),
            Convert = (obj, type) => {
                if(obj == null) return string.Empty;
                type = Nullable.GetUnderlyingType(type)!;
                obj = Convert.ChangeType(obj, type);
                var stringComponent = SerializeComponent(obj, type);
                return stringComponent;
            }
        },
        new() {
            Match = (type) => type.IsValueType,
            Convert = (obj, type) => {
                if(obj == null) return string.Empty;
                var json = JsonSerializer.Serialize(obj, type).Trim();
                if(json.StartsWith("\"") && json.EndsWith("\"")) {
                    json = json[1..^1];
                    var stringComponent = HttpUtility.UrlEncode(json);
                    return stringComponent;
                }
                return string.Empty;
            }
        },
        new() {
            Match = (type) => type == typeof(string),
            Convert = (obj, type) => {
                if(obj == null) return string.Empty;
                var stringComponent = HttpUtility.UrlEncode(obj.ToString()!);
                return stringComponent;
            }
        }
    };

    private static string SerializeComponent(object? obj, Type type)
    {
        if (obj == null) return string.Empty;
        if (type.IsPrimitive)
        {
            var stringComponent = HttpUtility.UrlEncode(obj.ToString())!;
            return stringComponent;
        }
        foreach (var converter in Converters)
        {
            if (converter.Match(type))
            {
                var stringComponent = converter.Convert(obj, type);
                return stringComponent;
            }
        }
        return string.Empty;
    }

    public static string Serialize(object? obj, Type type)
    {
        if (obj == null) return string.Empty;
        var stringComponent = SerializeComponent(obj, type);
        if (stringComponent != string.Empty) return $"?value={stringComponent}";
        //
        if (type.GetInterfaces().Any(x => x == typeof(IEnumerable)))
        {
            obj = new { values = obj as IEnumerable };
            type = obj.GetType();
        }
        //
        var properties = type.GetProperties();
        var parameters = new List<string>();
        foreach (var property in properties)
        {
            var name = HttpUtility.UrlEncode(string.Concat(property.Name[..1].ToLower(), property.Name.AsSpan(1)));
            var value = property.GetValue(obj);
            if (value == null) continue;
            stringComponent = SerializeComponent(value, property.PropertyType);
            if (stringComponent != string.Empty)
            {
                parameters.Add($"{name}={stringComponent}");
                continue;
            }
            if (property.PropertyType.GetInterfaces().Any(x => x == typeof(IEnumerable)))
            {
                var items = (value as IEnumerable)!;
                foreach (var item in items)
                {
                    if (item == null) continue;
                    stringComponent = SerializeComponent(item, item.GetType());
                    if (stringComponent == string.Empty) continue;
                    parameters.Add($"{name}={stringComponent}");
                }
            }
        }
        if (parameters.Count == 0) return string.Empty;
        var queryString = $"?{string.Join("&", parameters)}";
        return queryString;
    }

    public static string Serialize<T>(T? obj) => Serialize(obj, typeof(T));

    private class QueryStringConverter
    {
        public Func<Type, bool> Match { get; init; } = null!;
        public Func<object?, Type, string> Convert { get; init; } = null!;
    }

}