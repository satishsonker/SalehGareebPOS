import { commonLogic } from './commonLogic';

const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:7194';

export const tableHeaderFormat = {
    designModelData: [
        {
            key: 'medias',
            header: 'Thumbnail',
            width: '80px',
            align: 'center',
            render: (medias) => {
                const first = Array.isArray(medias) ? medias[0] : null;
                if (!first) return <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>—</span>;
                return (
                    <img
                        src={`${API_BASE}/${first.thumbRelativePath || first.relativePath}`}
                        alt="Thumbnail"
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, display: 'block', margin: '0 auto' }}
                    />
                );
            },
        },
        { key: 'name',         header: 'Name',        width: '200px' },
        { key: 'code',         header: 'Code',        width: '140px',
          render: (v) => <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{v}</span> },
        {
            key: 'designerName',
            header: 'Designer',
            width: '150px',
            render: (v) => v || <span style={{ color: 'var(--text-secondary)' }}>—</span>,
        },
        {
            key: 'medias',
            header: 'Photos',
            width: '80px',
            align: 'center',
            render: (medias) => (
                <span style={{ fontWeight: 600, color: medias?.length ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                    {medias?.length ?? 0}
                </span>
            ),
        },
        {
            key: 'orderPrices',
            header: 'Prices',
            width: '80px',
            align: 'center',
            render: (prices) => (
                <span style={{ fontWeight: 600, color: prices?.length ? '#15803d' : 'var(--text-secondary)' }}>
                    {prices?.length ?? 0}
                </span>
            ),
        },
        { key: 'createdAt', header: 'Created', width: '140px', render: commonLogic.formatDate },
    ],
    masterUserData: [
        {
            key: 'profilePicturePath',
            header: 'Image',
            width: '100px',
            align: 'center',
            render: (value) => (
                <img src={value ? `${process.env.REACT_APP_API_URL || 'https://localhost:7194'}/${value}` : '/default-profile.png'} alt="Profile" className="profile-picture" />
            ),
        },
        {
            key: 'username',
            header: 'Username',
            width: '150px',
        },
        {
            key: 'email',
            header: 'Email',
            width: '200px',
        },
        {
            key: 'mobile',
            header: 'Mobile',
            width: '150px',
            render: (value) => {
                if (!value) return 'No Mobile';
                return (
                    <span>
                        <a href={`tel:${value}`} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                            {value}
                        </a>
                    </span>
                );
            },
        },
        {
            key: 'roleCode',
            header: 'Role',
            width: '100px',
            align: 'center',
            render: (value) => (
                <span style={{ color: value ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    {value?.toUpperCase() === 'ADMIN' ? 'Admin' : 'Normal User'}
                </span>
            ),
        },
        {
            key: 'firstName',
            header: 'First Name',
            width: '150px',
        },
        {
            key: 'lastName',
            header: 'Last Name',
            width: '150px',
        },
        {
            key: 'isBlocked',
            header: 'Status',
            width: '100px',
            align: 'center',
            render: (value) => (
                <span style={{ color: value ? 'var(--danger-color)' : 'var(--success-color)' }}>
                    {value ? 'Blocked' : 'Active'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            width: '150px',
            render: commonLogic.formatDate,
        },
        {
            key: 'lastLoginAt',
            header: 'Last Login',
            width: '150px',
            render: commonLogic.formatDate,
        },
        {
            key: 'lastLoginAttempt',
            header: 'Last Login Attempt',
            width: '150px',
            render: commonLogic.formatDate,
        },
    ],
    masterShopData: [
         {
            key: 'shopImagePath',
            header: 'Image',
            width: '100px',
            align: 'center',
            render: (value) => (
                <img src={value ? `${process.env.REACT_APP_API_URL || 'https://localhost:7194'}/${value}` : '/assets/images/default-shop-image.jpg'} alt="Profile" className="profile-picture" />
            ),
        },
        {
            key: 'name',
            header: 'Shop Name',
        },
        {
            key: 'code',
            header: 'Code',
            width: '120px',
        },
        {
            key: 'address',
            header: 'Address',
        },
        {
            key: 'phone',
            header: 'Phone',
            width: '150px',
        },
        {
            key: 'email',
            header: 'Email',
        },
        {
            key: 'trn',
            header: 'TRN',
            width: '120px',
        },
    ],
    customerData: [
        {
            key: 'fullMobileNumber',
            header: 'Mobile',
            width: '160px',
            render: (value, row) => {
                const num = value || `${row.isdCode || ''}${row.mobile || ''}`;
                if (!num) return '—';
                return (
                    <a href={`tel:${num}`} style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>
                        {num}
                    </a>
                );
            },
        },
        {
            key: 'firstName',
            header: 'First Name',
            width: '130px',
        },
        {
            key: 'lastName',
            header: 'Last Name',
            width: '130px',
            render: (v) => v || '—',
        },
        {
            key: 'city',
            header: 'City',
            width: '120px',
            render: (v) => v || '—',
        },
        {
            key: 'trn',
            header: 'TRN',
            width: '130px',
            render: (v) => v || '—',
        },
        {
            key: 'isBlocked',
            header: 'Status',
            width: '90px',
            align: 'center',
            render: (value) => (
                <span style={{ color: value ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 600 }}>
                    {value ? 'Blocked' : 'Active'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            width: '140px',
            render: commonLogic.formatDate,
        },
    ],
    systemNotificationData: [
        {
            key: 'title',
            header: 'Title',
            width: '200px',
        },
        {
            key: 'notificationType',
            header: 'Type',
            width: '110px',
            align: 'center',
            render: (value) => {
                const map = {
                    Info:         { bg: '#dbeafe', color: '#1d4ed8' },
                    Warning:      { bg: '#fef3c7', color: '#b45309' },
                    Success:      { bg: '#dcfce7', color: '#15803d' },
                    Error:        { bg: '#fee2e2', color: '#dc2626' },
                    Announcement: { bg: '#f3e8ff', color: '#7e22ce' },
                };
                const s = map[value] || { bg: '#f1f5f9', color: '#475569' };
                return (
                    <span style={{
                        background: s.bg, color: s.color,
                        padding: '2px 10px', borderRadius: 20,
                        fontSize: '0.75rem', fontWeight: 700,
                    }}>
                        {value || '—'}
                    </span>
                );
            },
        },
        {
            key: 'targetAudience',
            header: 'Audience',
            width: '110px',
            align: 'center',
            render: (v) => v || 'All',
        },
        {
            key: 'isSent',
            header: 'Status',
            width: '100px',
            align: 'center',
            render: (value, row) => {
                if (value) {
                    return <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>Sent</span>;
                }
                if (row.scheduledAt) {
                    return <span style={{ color: '#b45309', fontWeight: 600 }}>Scheduled</span>;
                }
                return <span style={{ color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>Draft</span>;
            },
        },
        {
            key: 'scheduledAt',
            header: 'Scheduled',
            width: '140px',
            render: (v) => v ? commonLogic.formatDate(v) : '—',
        },
        {
            key: 'sentAt',
            header: 'Sent At',
            width: '140px',
            render: (v) => v ? commonLogic.formatDate(v) : '—',
        },
        {
            key: 'createdAt',
            header: 'Created',
            width: '140px',
            render: commonLogic.formatDate,
        },
    ],
    orderPriceData: [
        {
            key: 'price',
            header: 'Price',
            width: '140px',
            align: 'right',
            render: (v) => v != null ? Number(v).toFixed(2) : '—',
        },
        {
            key: 'validFrom',
            header: 'Valid From',
            width: '140px',
            render: commonLogic.formatDate,
        },
        {
            key: 'validTo',
            header: 'Valid To',
            width: '140px',
            render: commonLogic.formatDate,
        },
        {
            key: 'validTo',
            header: 'Status',
            width: '150px',
            align: 'center',
            render: (validTo, row) => {
                const now   = new Date();
                const from  = row.validFrom ? new Date(row.validFrom) : null;
                const to    = validTo       ? new Date(validTo)       : null;

                // Strip time for day-level comparison
                now.setHours(0, 0, 0, 0);
                if (to)   to.setHours(0, 0, 0, 0);
                if (from) from.setHours(0, 0, 0, 0);

                if (to && now > to) {
                    return (
                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                            Expired
                        </span>
                    );
                }
                if (from && now < from) {
                    return (
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                            Upcoming
                        </span>
                    );
                }
                if (to) {
                    const daysLeft = Math.ceil((to - now) / (1000 * 60 * 60 * 24));
                    if (daysLeft <= 7) {
                        return (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                                Expiring in {daysLeft}d
                            </span>
                        );
                    }
                }
                return (
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                        Live
                    </span>
                );
            },
        },
    ],
    masterData: [
        {
            key: 'id',
            header: 'ID',
            width: '80px',
            align: 'center',
        },
        {
            key: 'masterDataType',
            header: 'Master Data Type',
            width: '150px',
        },
        {
            key: 'code',
            header: 'Code',
            width: '180px',
        },
        {
            key: 'displayValue',
            header: 'DisplayValue',
        },
        {
            key: 'remark',
            header: 'Remark',
        },
        {
            key: 'displayOrder',
            header: 'Order',
            width: '80px',
            align: 'center',
        }, {
            key: 'canDelete',
            header: 'Can Delete',
            width: '100px',
            align: 'center',
            render: (value) => (
                <span className={value ? 'text-danger' : 'text-success' }>
                    {value ? 'No' : 'Yes'}
                </span>
            ),
        }
    ]
};