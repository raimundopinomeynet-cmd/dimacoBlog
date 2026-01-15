

interface getActionProps {
    action: string, 
    fields: string
}

interface GraphQLRequestBody {
    variables?: object;
    query?: string;
    mutation?: string;
}

interface getProviderProp {
    appName: string
}