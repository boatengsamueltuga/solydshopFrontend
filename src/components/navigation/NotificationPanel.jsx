import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiBell, HiX, HiCheckCircle, HiShoppingBag } from 'react-icons/hi';
import { closePanel } from '../../store/reducers/notificationReducer';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from '../../store/actions/notificationActions';

const TYPE_ICON = {
    NEW_ORDER:    <HiShoppingBag />,
    ORDER_STATUS: <HiCheckCircle />,
};

const formatTime = (iso) => {
    const d   = new Date(iso);
    const now = new Date();
    const diffMs  = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h ago`;
    return d.toLocaleDateString();
};

const NotificationPanel = () => {
    const dispatch  = useDispatch();
    const panelRef  = useRef(null);
    const { items, loading, unreadCount } = useSelector((s) => s.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                dispatch(closePanel());
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [dispatch]);

    const handleMarkRead = (id, read) => {
        if (!read) dispatch(markNotificationRead(id));
    };

    return (
        <div
            ref={panelRef}
            style={{
                position:        'absolute',
                top:             'calc(100% + 8px)',
                right:           0,
                width:           '340px',
                maxHeight:       '480px',
                backgroundColor: 'var(--surface)',
                border:          '1px solid var(--border)',
                borderRadius:    'var(--r-lg)',
                boxShadow:       '0 8px 32px rgba(0,0,0,0.32)',
                display:         'flex',
                flexDirection:   'column',
                zIndex:          9999,
                overflow:        'hidden',
            }}
        >
            {/* Header */}
            <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        'var(--space-4) var(--space-4)',
                borderBottom:   '1px solid var(--border)',
                flexShrink:     0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <HiBell style={{ color: 'var(--accent)', fontSize: '18px' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>
                        Notifications
                    </span>
                    {unreadCount > 0 && (
                        <span style={{
                            padding:         '1px 7px',
                            borderRadius:    '999px',
                            backgroundColor: 'var(--accent)',
                            color:           'var(--text)',
                            fontSize:        '11px',
                            fontWeight:      700,
                            fontFamily:      'var(--font-mono)',
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => dispatch(markAllNotificationsRead())}
                            style={{
                                background:  'none',
                                border:      'none',
                                color:       'var(--text-3)',
                                fontSize:    '11px',
                                cursor:      'pointer',
                                fontFamily:  'var(--font-body)',
                                padding:     '2px 6px',
                                borderRadius: 'var(--r-sm)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                        >
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={() => dispatch(closePanel())}
                        style={{
                            background:  'none',
                            border:      'none',
                            color:       'var(--text-3)',
                            cursor:      'pointer',
                            display:     'flex',
                            alignItems:  'center',
                            padding:     '2px',
                        }}
                    >
                        <HiX size={16} />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
                {loading ? (
                    <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                        Loading…
                    </p>
                ) : items.length === 0 ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                        <HiBell style={{ fontSize: '32px', color: 'var(--text-4)', marginBottom: 'var(--space-2)' }} />
                        <p style={{ color: 'var(--text-3)', fontSize: '13px', margin: 0 }}>No notifications yet</p>
                    </div>
                ) : (
                    items.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => handleMarkRead(n.id, n.read)}
                            style={{
                                display:         'flex',
                                gap:             'var(--space-3)',
                                padding:         'var(--space-3) var(--space-4)',
                                borderBottom:    '1px solid var(--border-subtle)',
                                cursor:          n.read ? 'default' : 'pointer',
                                backgroundColor: n.read ? 'transparent' : 'var(--accent-subtle)',
                                transition:      'background-color 0.15s',
                            }}
                            onMouseEnter={e => { if (!n.read) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                            onMouseLeave={e => { if (!n.read) e.currentTarget.style.backgroundColor = 'var(--accent-subtle)'; }}
                        >
                            <div style={{
                                flexShrink:      0,
                                width:           '30px',
                                height:          '30px',
                                borderRadius:    '50%',
                                backgroundColor: 'var(--accent-subtle)',
                                border:          '1px solid var(--accent-border)',
                                display:         'flex',
                                alignItems:      'center',
                                justifyContent:  'center',
                                color:           'var(--accent)',
                                fontSize:        '15px',
                                marginTop:       '1px',
                            }}>
                                {TYPE_ICON[n.type] ?? <HiBell />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    fontFamily:   'var(--font-display)',
                                    fontWeight:   n.read ? 500 : 700,
                                    fontSize:     '13px',
                                    color:        'var(--text)',
                                    margin:       '0 0 2px',
                                    overflow:     'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace:   'nowrap',
                                }}>
                                    {n.title}
                                </p>
                                <p style={{
                                    fontFamily:   'var(--font-body)',
                                    fontSize:     '12px',
                                    color:        'var(--text-2)',
                                    margin:       '0 0 4px',
                                    overflow:     'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace:   'nowrap',
                                }}>
                                    {n.message}
                                </p>
                                <p style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize:   '11px',
                                    color:      'var(--text-4)',
                                    margin:     0,
                                }}>
                                    {formatTime(n.createdAt)}
                                </p>
                            </div>
                            {!n.read && (
                                <div style={{
                                    flexShrink:      0,
                                    width:           '7px',
                                    height:          '7px',
                                    borderRadius:    '50%',
                                    backgroundColor: 'var(--accent)',
                                    alignSelf:       'center',
                                }} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
