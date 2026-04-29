import { commonLogic } from './commonLogic';
export const tableHeaderFormat = {
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
    orderPriceData: [
        {
            key: 'id',
            header: 'ID',
            width: '80px',
            align: 'center',
        },
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
            width: '160px',
            render: commonLogic.formatDate,
        },
        {
            key: 'validTo',
            header: 'Valid To',
            width: '160px',
            render: commonLogic.formatDate,
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