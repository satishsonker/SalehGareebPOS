import  {commonLogic}  from './commonLogic';
export const tableHeaderFormat = {
    masterUserData: [
        {
            key: 'profilePicturePath',
            header: 'Image',
            width: '100px',
            align: 'center',
            render: (value) => (
                <img src={value ? `${process.env.REACT_APP_API_URL || 'https://localhost:7194'}/images/${value}` : '/default-profile.png'} alt="Profile" className="profile-picture" />
            ),
        },
        {
            key: 'id',
            header: 'ID',
            width: '80px',
            align: 'center',
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
    masterShopData:  [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      align: 'center',
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
};