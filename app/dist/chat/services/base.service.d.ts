import { Repository } from "typeorm";
import Base from "../entities/base.entity";
export declare class BasesServices {
    private readonly basesrepository;
    constructor(basesrepository: Repository<Base>);
}
