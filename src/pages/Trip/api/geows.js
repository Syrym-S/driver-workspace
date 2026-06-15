/**
 * WebSocket client for GeoWS
 *
 * Сервер ожидает query:
 *  - token (session key)
 *  - user_id
 *
 * Сообщения:
 *  - входящие: { type: "get_points", data: [...] }
 *  - исходящие: зависит от роутинга (type field)
 */

/**
 * @param {Object} params
 * @param {string} params.wsUrl - base ws url (пример: wss://logistic.prodavay.kz:8282)
 * @param {string} params.token - session key
 * @param {number|string} params.userId - wp current user id
 * @returns {WebSocket}
 */
export function connectGeoWS({ wsUrl, token, userId }) {
    if (!wsUrl) throw new Error('WS URL not configured')
    if (!token) throw new Error('Session token missing')
    if (!userId) throw new Error('User ID missing')

    const url = new URL(wsUrl)
    url.searchParams.set('token', token)
    url.searchParams.set('user_id', String(userId))

    const ws = new WebSocket(url.toString())
    return ws
}

/**
 * Подписка на события WS
 */
export function bindGeoWS(ws, handlers = {}) {
    const {
        onOpen,
        onClose,
        onError,
        onAuthFailed,
        onPoints,
        onMessage,
    } = handlers

    ws.onopen = () => {
        onOpen?.()
        console.log('WS opened')
    }

    ws.onerror = (e) => {
        onError?.(e)
        console.log('WS error:', e)
    }

    ws.onclose = () => {
        onClose?.()
          console.log('WS closed')
    }

    ws.onmessage = (event) => {
        let payload = null

        try {
            payload = JSON.parse(event.data)
        } catch (e) {
            return
        }
        console.log('WS message:', payload)

        onMessage?.(payload)

        // auth failed на сервере
        if (payload?.type === 'error') {
            if (String(payload?.message).toLowerCase().includes('auth failed')) {
                onAuthFailed?.(payload)
            }
        }

        // точки
        if (payload?.type === 'get_points') {
            onPoints?.(payload?.data ?? [])
        }
    }
}

/**
 * Запросить точки с сервера
 * Сервер роутит по `type` в data
 */
export function requestGeoPoints(ws, allowedType) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    // type должен совпасть с $connection->type
    ws.send(
        JSON.stringify({
            type: allowedType, // 'read' или 'add'
            action: 'get_points',
        })
    )
}

export function getBrowserLocation(options = {}) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported in this browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve(pos)
            },
            (err) => {
                reject(err)
            },
            {
                enableHighAccuracy: true,
                timeout: 15_000,
                maximumAge: 0,
                ...options,
            }
        )
    })
}

export function sendGeoPoint(ws, point) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    ws.send(
        JSON.stringify({
            type: 'add',
            point: {
                latitude: point.latitude,
                longitude: point.longitude,
                altitude: point.altitude ?? 0,
            },
        })
    )
}