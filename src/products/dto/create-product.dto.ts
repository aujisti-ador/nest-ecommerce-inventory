import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsNumber()
    @IsOptional()
    buying_price: number;

    @IsNumber()
    stock: number;

    @IsOptional()
    category_id: string;

    @IsString()
    product_code: string;

    @IsString()
    @IsOptional()
    size: string;

    @IsString()
    @IsOptional()
    color: string;
    
    @IsBoolean()
    @IsOptional()
    active: boolean;
}
