import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import type { IWorkspaces } from '@deepseek-ai/dsh-client-runtime/client';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'sidebar.footer.action': {
            kind: 'list';
            scope: 'root';
            owner: {
                wide: boolean;
            };
        };
    }
}
type Ctx = ClientContext & {
    workspaces: IWorkspaces;
};
export declare const inject: string[];
export declare function apply(ctx: Ctx): void;
export {};
