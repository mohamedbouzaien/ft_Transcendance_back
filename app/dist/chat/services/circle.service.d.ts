import { Repository } from "typeorm";
import Circle from "../entities/circle.entity";
export declare class CirclesServices {
    private readonly circlesrepository;
    constructor(circlesrepository: Repository<Circle>);
    create(ray: number): Promise<Circle>;
    get(id: number): Promise<Circle>;
}
