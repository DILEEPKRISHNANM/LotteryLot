export const getCurrentRoute = () =>{
    return window.location.pathname;
}

export const isAuthRoute = (route: string) =>{
    return route.includes('/login') || route.includes('/register');
}