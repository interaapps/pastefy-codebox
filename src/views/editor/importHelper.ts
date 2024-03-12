export default [
    {
        file: 'react',
        analysed: {
            defaultExport: 'React',
            exports: [
                'useState',
                'useEffect',
                'useContext',
                'useReducer',
                'useCallback',
                'useMemo',
                'useRef',
                'useImperativeHandle',
                'useLayoutEffect',
                'useDebugValue',
                'useDeferredValue',
                'useTransition',
                'startTransition',
                'useId',
                'useSyncExternalStore',
                'useInsertionEffect',
                'Component',
                'PureComponent',
                'lazy',
                'Suspense',
                'createRef',
                'forwardRef',
                'Fragment',
                'Children',
                'isValidElement',
                'cloneElement',
                'memo',
            ]
        }
    },
    {
        file: 'vue',
        analysed: {
            defaultExport: 'Vue',
            exports: [
                'createApp',
                'createSSRApp',
                'nextTick',
                'defineComponent',
                'defineAsyncComponent',
                'defineCustomElement',
            ]
        }
    },
    {
        file: 'jdomjs',
        analysed: {
            defaultExport: undefined,
            exports: [
                '$',
                '$n',
                '$h',
                '$escHTML',
                '$r',
                '$c',
                'JDOMComponent',
                'state',
                'watch',
                'computed',
                'bind',
                'html',
                'css',
                'comp',
                'Hook',
                'JDOM',
            ]
        }
    }
]