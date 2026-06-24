import { ordersActions, ordersSelector } from '@slices/orders'
import { useActionCreators, useDispatch, useSelector } from '@store/hooks'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchOrdersWithFilters } from '../../services/slice/orders/thunk'
import { AppRoute } from '../../utils/constants'
import { StatusType } from '@types' // ✅ Добавляем импорт статусов
import Filter from '../filter'
import styles from './admin.module.scss'
import { ordersFilterFields } from './helpers/ordersFilterFields'

// ✅ БЕЗОПАСНО: определяем тип для значений фильтров
type FilterValue = string | number | { value: string; label: string } | undefined;

export default function AdminFilterOrders() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [_, setSearchParams] = useSearchParams()

    const { updateFilter, clearFilters } = useActionCreators(ordersActions)
    const filterOrderOption = useSelector(ordersSelector.selectFilterOption)

    // ✅ ИСПРАВЛЕНО: заменяем any на Record<string, FilterValue>
    const handleFilter = (filters: Record<string, FilterValue>) => {
        // Безопасно извлекаем status.value, если это объект
        let statusValue: StatusType | "" = "";
        
        if (filters.status && typeof filters.status === 'object' && 'value' in filters.status) {
            // Проверяем, что значение является допустимым статусом
            const statusStr = filters.status.value;
            if (Object.values(StatusType).includes(statusStr as StatusType)) {
                statusValue = statusStr as StatusType;
            }
        } else if (typeof filters.status === 'string' && filters.status !== '') {
            // Если status пришёл как строка, проверяем его
            if (Object.values(StatusType).includes(filters.status as StatusType)) {
                statusValue = filters.status as StatusType;
            }
        }

        // Создаём объект фильтров с правильными типами
        const filterData: Record<string, any> = { ...filters };
        if (statusValue !== undefined) {
            filterData.status = statusValue;
        } else {
            delete filterData.status; // Удаляем status, если он невалидный
        }

        dispatch(updateFilter(filterData))
        
        const queryParams: { [key: string]: string } = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value && key !== 'status') {
                queryParams[key] =
                    typeof value === 'object' && value !== null && 'value' in value
                        ? value.value
                        : value.toString()
            }
        })
        
        // Добавляем status в queryParams, если он валидный
        if (statusValue) {
            queryParams.status = statusValue;
        }

        setSearchParams(queryParams)
        navigate(
            `${AppRoute.AdminOrders}?${new URLSearchParams(queryParams).toString()}`
        )
    }

    const handleClearFilters = () => {
        dispatch(clearFilters())
        setSearchParams({})
        dispatch(fetchOrdersWithFilters({}))
        navigate(AppRoute.AdminOrders)
    }

    return (
        <>
            <h2 className={styles.admin__title}>Фильтры</h2>
            <Filter
                fields={ordersFilterFields}
                onFilter={handleFilter}
                onClear={handleClearFilters}
                defaultValue={filterOrderOption}
            />
        </>
    )
}