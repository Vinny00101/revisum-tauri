import { useMemo, useState } from "react";

export type FilterDefinition<T, K extends string> = {
    key: K,
    label?: string,
    apply: (item: T) => boolean;
}

export type SearchDefinition<T> = {
    keys: (keyof T)[],
}

export function useSmartFilterSearch<T, K extends string>(
    data: T[],
    filters: readonly FilterDefinition<T, K>[],
    defaultFilter: K,
    searchDefinition: SearchDefinition<T>
) {
    const [activeFilter, setActiveFilter] = useState<K>(defaultFilter);
    const [activeSearch, setActiveSearch] = useState("");

    // Determina qual ferramenta está "dominando"
    const getDominantTool = useMemo(() => {
        if (activeSearch.trim() !== "") {
            return 'search';
        }
        if (activeFilter !== defaultFilter) {
            return 'filter';
        }
        return 'none';
    }, [activeFilter, activeSearch, defaultFilter]);

    const processedData = useMemo(() => {
        let result = [...data];

        // Sempre aplicar filtro primeiro (se não for padrão)
        if (activeFilter !== defaultFilter) {
            const filter = filters.find(f => f.key === activeFilter);
            if (filter) {
                result = result.filter(filter.apply);
            }
        }

        // Depois aplicar busca (se houver)
        if (activeSearch.trim()) {
            const searchLower = activeSearch.toLowerCase();
            result = result.filter(item =>
                searchDefinition.keys.some(key => {
                    const value = item[key];
                    if (value == null) return false;
                    return String(value).toLowerCase().includes(searchLower);
                })
            );
        }

        return result;
    }, [data, filters, activeFilter, defaultFilter, searchDefinition, activeSearch]);

    const handleSetFilter = (filter: K) => {
        setActiveFilter(filter);
    };

    const handleSetSearch = (search: string) => {
        setActiveSearch(search);
        // Busca sempre trabalha sobre os dados filtrados atuais
    };

    const clearSearch = () => {
        setActiveSearch("");
    };

    const clearFilter = () => {
        setActiveFilter(defaultFilter);
    };

    const clearAll = () => {
        clearSearch();
        clearFilter();
    };

    return {
        // Estado
        filter: activeFilter,
        search: activeSearch,
        
        // Setters
        setFilter: handleSetFilter,
        setSearch: handleSetSearch,
        
        // Clear functions
        clearSearch,
        clearFilter,
        clearAll,
        
        // Dados processados
        processedData,
        
        // Metadados
        dominantTool: getDominantTool,
        isFilterActive: activeFilter !== defaultFilter,
        isSearchActive: activeSearch.trim() !== "",
        hasBothActive: activeFilter !== defaultFilter && activeSearch.trim() !== "",
        
        // Contadores
        totalItems: data.length,
        filteredItems: processedData.length,
    };
}