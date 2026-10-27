export interface User {
    id: string;
    name: string;
    email: string;
    roles?: string[];
    permissions?: string[];
    can?: {
        dojo_create?: boolean;
        kenshi_create?: boolean;
        kenshi_manage?: boolean;
        schedule_create?: boolean;
        view_reports?: boolean;
        view_finance?: boolean;
        view_system_logs?: boolean;
        view_my_dojo?: boolean;
        view_kta_portal?: boolean;
    };
}

export interface Dojo {
    id: string;
    code: string;
    name: string;
    pengprov: string;
    pengkab: string;
    address?: string | null;
    city?: string | null;
    head_sensei?: {
        id: string;
        name: string;
        email: string;
    } | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    status: {
        value: string;
        label: string;
        color: string;
    };
    kenshis_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Kenshi {
    id: string;
    id_card_number: string;
    full_name: string;
    nickname?: string | null;
    gender: 'M' | 'F';
    place_of_birth?: string | null;
    date_of_birth?: string | null;
    blood_type?: string | null;
    rank: {
        value: string;
        label: string;
        belt_color: string;
        is_dan: boolean;
    };
    member_type?: 'athlete' | 'coach';
    phone?: string | null;
    address?: string | null;
    is_active: boolean;
    joined_at?: string | null;
    dojo?: {
        id: string;
        name: string;
        code: string;
        pengprov: string;
    } | null;
    created_at?: string;
}

export interface TrainingSchedule {
    id: string;
    dojo_id: string;
    dojo?: {
        id: string;
        name: string;
        code: string;
        pengprov: string;
    } | null;
    title: string;
    program_type: {
        value: string;
        label: string;
        color: string;
    };
    date: string;
    start_time: string;
    end_time: string;
    location_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    radius_meters?: number;
    instructor_name?: string | null;
    notes?: string | null;
    status: string;
    attendances_count?: number;
    created_at?: string;
}

export interface Attendance {
    id: string;
    training_schedule_id: string;
    kenshi_id: string;
    kenshi?: {
        id: string;
        id_card_number: string;
        full_name: string;
        nickname?: string | null;
        gender: string;
        rank?: {
            value: string;
            label: string;
            belt_color: string;
        } | null;
    } | null;
    schedule?: {
        id: string;
        title: string;
        date: string;
        start_time: string;
        end_time: string;
        location_name?: string | null;
    } | null;
    status: {
        value: string;
        label: string;
        color: string;
    };
    check_in_at?: string | null;
    check_in_time?: string | null;
    photo_url?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    location_accuracy?: number | null;
    distance_meters?: number | null;
    is_within_radius: boolean;
    verified_by?: string | null;
    is_approved?: boolean;
    verifier?: {
        id: string;
        name: string;
    } | null;
    notes?: string | null;
    created_at?: string;
}

export interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links?: PaginationLinks[] | { first?: string | null; last?: string | null; prev?: string | null; next?: string | null };
    meta?: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: PaginationLinks[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
    current_page?: number;
    from?: number | null;
    last_page?: number;
    path?: string;
    per_page?: number;
    to?: number | null;
    total?: number;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
    info?: string | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
    };
    flash: FlashMessages;
    app: {
        name: string;
        version: string;
    };
};

declare global {
    function route(name?: string, params?: any, absolute?: boolean): any;
}
