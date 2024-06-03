module.exports = {
    extends: ['next/core-web-vitals'],
    overrides: [
        {
            files: '__test__/**',
            plugins: ['jest'],
            extends: 'plugin:jest/recommended',
            rules: {
                'jest/max-nested-describe': [
                    'error',
                    {
                        max: 2,
                    },
                ],
                'jest/prefer-each': 'error',
            },
        },
        {
            files: '__test__/**',
            plugins: ['testing-library'],
            extends: 'plugin:testing-library/react',
        },
    ],
};
