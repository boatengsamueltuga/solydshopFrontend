import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiBell, HiX, HiCheckCircle, HiShoppingBag, HiTrash, HiClipboardList, HiExclamationCircle, HiArchive, HiPause, HiBadgeCheck, HiSwitchHorizontal, HiDocumentText } from 'react-icons/hi';
import Tooltip from '@mui/material/Tooltip';
import { closePanel } from '../../store/reducers/notificationReducer';
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
} from '../../store/actions/notificationActions';

const TYPE_ICON = {
    NEW_ORDER:         <HiShoppingBag />,
    ORDER_STATUS:      <HiCheckCircle />,
    QUOTE_REQUEST:     <HiDocumentText />,
    QUOTE_RESPONSE:    <HiDocumentText />,
    PRODUCT_REVIEW:    <HiClipboardList />,
    PRODUCT_APPROVED:  <HiCheckCircle />,
    PRODUCT_REJECTED:  <HiExclamationCircle />,
    PRODUCT_SUSPENDED: <HiPause />,
    PRODUCT_ARCHIVED:  <HiArchive />,
    PRODUCT_REINSTATED: <HiCheckCircle />,
    SELLER_APPLICATION: <HiBadgeCheck />,
    SELLER_APPROVED:   <HiBadgeCheck />,
    SELLER_REJECTED:   <HiExclamationCircle />,
    SELLER_DOWNGRADE_REQUEST:  <HiSwitchHorizontal />,
    SELLER_DOWNGRADE_APPROVED: <HiCheckCircle />,
    SELLER_DOWNGRADE_REJECTED: <HiExclamationCircle />,
};

const TYPE_COLOR = {
    NEW_ORDER:         'var(--success)',
    ORDER_STATUS:      'var(--info)',
    QUOTE_REQUEST:     'var(--warning)',
    QUOTE_RESPONSE:    'var(--info)',
    PRODUCT_REVIEW:    'var(--warning)',
    PRODUCT_APPROVED:  'var(--success)',
    PRODUCT_REJECTED:  'var(--error)',
    PRODUCT_SUSPENDED: '#60a5fa',
    PRODUCT_ARCHIVED:  'var(--text-3)',
    PRODUCT_REINSTATED: 'var(--success)',
    SELLER_APPLICATION: 'var(--warning)',
    SELLER_APPROVED:   'var(--success)',
    SELLER_REJECTED:   'var(--error)',
    SELLER_DOWNGRADE_REQUEST:  'var(--warning)',
    SELLER_DOWNGRADE_APPROVED: 'var(--success)',
    SELLER_DOWNGRADE_REJECTED: 'var(--error)',
};

/* build navigation target from a notification. isAdmin disambiguates types
   that are sent to more than one audience (e.g. a quote request goes to
   either the seller or, for platform products, every admin). */
const getNavTarget = (n, isAdmin) => {
    switch (n.type) {
        case 'PRODUCT_REVIEW':
            return { path: '/admin/products',   state: { autoFilter: 'PENDING_REVIEW', highlightProductId: n.resourceId } };
        case 'SELLER_APPLICATION':
            return { path: '/admin/seller-applications', state: {} };
        case 'PRODUCT_APPROVED':
        case 'PRODUCT_REJECTED':
        case 'PRODUCT_SUSPENDED':
        case 'PRODUCT_ARCHIVED':
        case 'PRODUCT_REINSTATED':
            return { path: '/seller/dashboard', state: { highlightProductId: n.resourceId } };
        case 'SELLER_APPROVED':
            return { path: '/seller/dashboard', state: {} };
        case 'SELLER_REJECTED':
            return { path: '/seller-application', state: {} };
        case 'SELLER_DOWNGRADE_REQUEST':
            return { path: '/admin/seller-downgrade-requests', state: {} };
        case 'SELLER_DOWNGRADE_APPROVED':
            return { path: '/account', state: {} };
        case 'SELLER_DOWNGRADE_REJECTED':
            return { path: '/seller/dashboard', state: {} };
        case 'QUOTE_REQUEST':
            return isAdmin
                ? { path: '/admin/quotes', state: {} }
                : { path: '/seller/quotes', state: {} };
        case 'QUOTE_RESPONSE':
            return { path: '/quotes/my', state: {} };
        case 'NEW_ORDER':
            return isAdmin
                ? { path: '/admin/orders', state: {} }
                : { path: '/seller/dashboard', state: {} };
        case 'ORDER_STATUS':
            return { path: '/orders', state: {} };
        default:
            return null;
    }
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
    const navigate  = useNavigate();
    const panelRef  = useRef(null);
    const { items, loading, unreadCount } = useSelector((s) => s.notifications);
    const { user } = useSelector((s) => s.auth);
    const isAdmin  = Boolean(user?.roles?.includes('ROLE_ADMIN'));

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        const handler = (e) => {
            const el = panelRef.current;
            // Ignore duplicate instances that are mounted but hidden (e.g. the
            // mobile panel while on desktop, or vice-versa). A CSS-hidden element
            // has no offsetParent; letting its handler run would close the visible
            // panel on mousedown before the clicked item's onClick can fire.
            if (!el || el.offsetParent === null) return;
            if (!el.contains(e.target)) {
                dispatch(closePanel());
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [dispatch]);

    const handleClick = (n) => {
        if (!n.read) dispatch(markNotificationRead(n.id));
        const dest = getNavTarget(n, isAdmin);
        if (dest) {
            dispatch(closePanel());
            navigate(dest.path, { state: dest.state });
        }
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
                                background:   'none',
                                border:       'none',
                                color:        'var(--text-3)',
                                fontSize:     '11px',
                                cursor:       'pointer',
                                fontFamily:   'var(--font-body)',
                                padding:      '2px 6px',
                                borderRadius: 'var(--r-sm)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                        >
                            Mark all read
                        </button>
                    )}
                    {items.length > 0 && (
                        <button
                            onClick={() => dispatch(deleteAllNotifications())}
                            style={{
                                background:   'none',
                                border:       'none',
                                color:        'var(--text-3)',
                                fontSize:     '11px',
                                cursor:       'pointer',
                                fontFamily:   'var(--font-body)',
                                padding:      '2px 6px',
                                borderRadius: 'var(--r-sm)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-subtle)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                        >
                            Clear all
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
                    items.map((n) => {
                        const iconColor  = TYPE_COLOR[n.type] ?? 'var(--accent)';
                        const clickable  = Boolean(getNavTarget(n, isAdmin)) || !n.read;
                        return (
                        <div
                            key={n.id}
                            onClick={() => handleClick(n)}
                            style={{
                                display:         'flex',
                                gap:             'var(--space-3)',
                                padding:         'var(--space-3) var(--space-4)',
                                borderBottom:    '1px solid var(--border-subtle)',
                                cursor:          clickable ? 'pointer' : 'default',
                                backgroundColor: n.read ? 'transparent' : 'var(--accent-subtle)',
                                transition:      'background-color 0.15s',
                            }}
                            onMouseEnter={e => { if (clickable) e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'var(--accent-subtle)'; }}
                        >
                            <div style={{
                                flexShrink:      0,
                                width:           '30px',
                                height:          '30px',
                                borderRadius:    '50%',
                                backgroundColor: `color-mix(in srgb, ${iconColor} 12%, transparent)`,
                                border:          `1px solid color-mix(in srgb, ${iconColor} 30%, transparent)`,
                                display:         'flex',
                                alignItems:      'center',
                                justifyContent:  'center',
                                color:           iconColor,
                                fontSize:        '15px',
                                marginTop:       '1px',
                            }}>
                                {TYPE_ICON[n.type] ?? <HiBell />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {n.title.length > 32
                                    ? <Tooltip title={n.title} placement="bottom-start" enterDelay={300} arrow>
                                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: n.read ? 500 : 700, fontSize: '13px', color: 'var(--text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'help' }}>
                                            {n.title}
                                        </p>
                                      </Tooltip>
                                    : <p style={{ fontFamily: 'var(--font-display)', fontWeight: n.read ? 500 : 700, fontSize: '13px', color: 'var(--text)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {n.title}
                                      </p>
                                }
                                {n.message.length > 50
                                    ? <Tooltip title={n.message} placement="bottom-start" enterDelay={300} arrow>
                                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-2)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'help' }}>
                                            {n.message}
                                        </p>
                                      </Tooltip>
                                    : <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-2)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {n.message}
                                      </p>
                                }
                                {getNavTarget(n, isAdmin) && (
                                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: iconColor, margin: 0 }}>
                                        Click to view
                                    </p>
                                )}
                                <p style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize:   '11px',
                                    color:      'var(--text-4)',
                                    margin:     0,
                                }}>
                                    {formatTime(n.createdAt)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                {!n.read && (
                                    <div style={{
                                        width:           '7px',
                                        height:          '7px',
                                        borderRadius:    '50%',
                                        backgroundColor: 'var(--accent)',
                                    }} />
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); dispatch(deleteNotification(n.id)); }}
                                    style={{
                                        background:   'none',
                                        border:       'none',
                                        cursor:       'pointer',
                                        color:        'var(--text-4)',
                                        padding:      '2px',
                                        display:      'flex',
                                        alignItems:   'center',
                                        borderRadius: 'var(--r-sm)',
                                        fontSize:     '13px',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-subtle)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.background = 'none'; }}
                                    title="Delete"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
