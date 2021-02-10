type InjectOptionCallback = (options: any) => void;
type InjectableCallback = InjectOptionCallback | Promise<InjectOptionCallback>;