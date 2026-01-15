
export function getSpecificationValues(
    specificationGroups,
    groupName,
    keysToFind
) {
    const group = specificationGroups.find(g => g.name === groupName);

    if (!group || !group.specifications) return {};

    const result = {};

    group.specifications.forEach(spec => {
        if (keysToFind.includes(spec.name)) {
            const values = spec.values;
            result[spec.name] = values.length === 1 ? values[0] : values;
        }
    });

    return result;
}

export const getStringValue = (value) => {
    if (typeof value === "string") {
        return value
    }
    return null
}