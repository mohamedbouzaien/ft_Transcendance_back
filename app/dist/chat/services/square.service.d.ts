import { Repository } from "typeorm";
import Square from "../entities/square.entity";
export declare class SquaresServices {
    private readonly squaresrepository;
    constructor(squaresrepository: Repository<Square>);
    create(side: number): Promise<Square>;
    get(id: number): Promise<Square>;
}
